// VideoExportService.ts
// Handles video export functionality for pose animations

export interface VideoExportOptions {
  width: number;
  height: number;
  fps: number;
  duration: number;
  quality: number; // 0-1
  format: 'webm' | 'mp4';
}

export class VideoExportService {
  private static instance: VideoExportService;
  private isExporting = false;

  static getInstance(): VideoExportService {
    if (!VideoExportService.instance) {
      VideoExportService.instance = new VideoExportService();
    }
    return VideoExportService.instance;
  }

  async exportPoseAnimationAsVideo(
    poseFile: Blob,
    options: VideoExportOptions = {
      width: 640,
      height: 480,
      fps: 30,
      duration: 5,
      quality: 0.8,
      format: 'webm'
    }
  ): Promise<Blob> {
    if (this.isExporting) {
      throw new Error('Video export already in progress');
    }

    this.isExporting = true;

    try {
      // Create a video element to play the pose animation
      const video = document.createElement('video');
      video.src = URL.createObjectURL(poseFile);
      video.width = options.width;
      video.height = options.height;
      video.muted = true;
      video.loop = false;

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
        video.load();
      });

      // Set up canvas for recording
      const canvas = document.createElement('canvas');
      canvas.width = options.width;
      canvas.height = options.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set up MediaRecorder
      const stream = canvas.captureStream(options.fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: `video/${options.format};codecs=vp8`,
        videoBitsPerSecond: Math.floor(options.quality * 1000000) // 1Mbps max
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start(100); // Record in 100ms chunks

      // Play the animation and record it
      video.currentTime = 0;
      video.play();

      const startTime = Date.now();
      const recordDuration = options.duration * 1000; // Convert to milliseconds

      return new Promise<Blob>((resolve, reject) => {
        const recordFrame = () => {
          if (Date.now() - startTime >= recordDuration) {
            // Stop recording
            mediaRecorder.stop();
            video.pause();
            URL.revokeObjectURL(video.src);
            return;
          }

          // Draw current frame to canvas
          ctx.drawImage(video, 0, 0, options.width, options.height);
          requestAnimationFrame(recordFrame);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: `video/${options.format}` });
          this.isExporting = false;
          resolve(blob);
        };

        mediaRecorder.onerror = (error) => {
          this.isExporting = false;
          reject(error);
        };

        // Start recording frames
        recordFrame();
      });

    } catch (error) {
      this.isExporting = false;
      throw error;
    }
  }

  async downloadVideo(blob: Blob, filename: string = 'sign-animation'): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${blob.type.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Check if video export is supported
  isSupported(): boolean {
    return (
      typeof MediaRecorder !== 'undefined' &&
      MediaRecorder.isTypeSupported('video/webm;codecs=vp8') &&
      typeof HTMLCanvasElement.prototype.captureStream === 'function'
    );
  }

  // Get supported video formats
  getSupportedFormats(): string[] {
    const formats = [];
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      formats.push('webm');
    }
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
      formats.push('mp4');
    }
    return formats;
  }
}

export default VideoExportService;
