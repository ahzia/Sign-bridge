import type { ArrayBufferTarget as WebmArrayBufferTarget, Muxer as WebmMuxer } from 'webm-muxer';
import type { ArrayBufferTarget as Mp4ArrayBufferTarget, Muxer as Mp4Muxer } from 'mp4-muxer';
import { Muxer as WebmMuxerImpl, ArrayBufferTarget as WebmArrayBufferTargetImpl } from 'webm-muxer';
import { Muxer as Mp4MuxerImpl, ArrayBufferTarget as Mp4ArrayBufferTargetImpl } from 'mp4-muxer';

export function getMediaSourceClass(): typeof MediaSource | null {
  if ('ManagedMediaSource' in window) {
    return window.ManagedMediaSource as any;
  }
  if ('MediaSource' in window) {
    return MediaSource;
  }
  if ('WebKitMediaSource' in window) {
    return window['WebKitMediaSource'] as any;
  }

  console.warn('Neither ManagedMediaSource nor MediaSource are supported on this device');
  return null;
}

export class VideoEncoderService {
  private muxer?: WebmMuxer<WebmArrayBufferTarget> | Mp4Muxer<Mp4ArrayBufferTarget>;
  private videoEncoder?: VideoEncoder;
  private frameBuffer: VideoFrame[] = []; // Buffer frames until the encoder is ready

  private container!: 'webm' | 'mp4';
  private codec!: string;
  private bitrate = 10_000_000; // 10Mbps max
  private alpha = true;

  private width!: number;
  private height!: number;

  private image: ImageBitmap;
  private fps: number;

  constructor(
    image: ImageBitmap,
    fps: number
  ) {
    this.image = image;
    this.fps = fps;
  }

  static isSupported(): boolean {
    return 'VideoEncoder' in globalThis;
  }

  async init(): Promise<void> {
    await this.createWebMMuxer();
    let playable = await this.isPlayable();
    if (!playable) {
      // If WebM is not playable or undetermined, fall back to MP4
      await this.createMP4Muxer();
    }

    this.createVideoEncoder();
  }

  private async isPlayable(): Promise<boolean> {
    if (!('navigator' in globalThis)) {
      return false;
    }

    if (!('mediaCapabilities' in navigator)) {
      const mediaSourceClass = getMediaSourceClass();
      if (!mediaSourceClass) {
        return false;
      }

      const mimeType = `video/${this.container}; codecs="${this.codec}"`;
      return mediaSourceClass.isTypeSupported(mimeType);
    }

    const videoConfig = {
      contentType: `video/${this.container}; codecs="${this.codec}"`,
      width: this.width,
      height: this.height,
      bitrate: this.bitrate,
      framerate: this.fps,
      hasAlphaChannel: this.alpha,
    };

    const { supported } = await navigator.mediaCapabilities.decodingInfo({ type: 'file', video: videoConfig });
    return supported;
  }

  private async createWebMMuxer(): Promise<void> {
    // Set the metadata
    this.container = 'webm';
    this.codec = 'vp09.00.10.08';
    this.width = this.image.width;
    this.height = this.image.height;

    // Create the muxer
    this.muxer = new WebmMuxerImpl({
      target: new WebmArrayBufferTargetImpl(),
      video: {
        codec: 'V_VP9',
        width: this.width,
        height: this.height,
        frameRate: this.fps,
        alpha: this.alpha,
      },
    });
  }

  private async createMP4Muxer(): Promise<void> {
    // Set the metadata
    this.container = 'mp4';
    this.codec = 'avc1.42001f';
    // H264 only supports even sized frames
    this.width = this.image.width + (this.image.width % 2);
    this.height = this.image.height + (this.image.height % 2);

    // Create the muxer
    this.muxer = new Mp4MuxerImpl({
      target: new Mp4ArrayBufferTargetImpl(),
      fastStart: 'in-memory',
      video: {
        codec: 'avc',
        width: this.width,
        height: this.height,
      },
    });
  }

  private createVideoEncoder(): void {
    this.videoEncoder = new VideoEncoder({
      output: (chunk, meta) => this.muxer.addVideoChunk(chunk, meta),
      error: (e) => console.error('Video encoding error:', e),
    });

    const config = {
      codec: this.codec,
      width: this.width,
      height: this.height,
      bitrate: this.bitrate,
      framerate: this.fps,
      // TODO: alpha support not yet available in Chrome
      // alpha: this.muxer.alpha ? 'keep' as AlphaOption : false
    };

    this.videoEncoder.configure(config);

    // Flush the frame buffer
    for (const frame of this.frameBuffer) {
      this.encodeFrame(frame);
    }
    this.frameBuffer = [];
  }

  addFrame(index: number, image: ImageBitmap): void {
    const ms = 1_000_000; // 1µs
    const frame = new VideoFrame(image, {
      timestamp: (ms * index) / this.fps,
      duration: ms / this.fps,
    });

    if (this.videoEncoder) {
      this.encodeFrame(frame);
    } else {
      this.frameBuffer.push(frame);
    }
  }

  private encodeFrame(frame: VideoFrame): void {
    this.videoEncoder.encode(frame);
    frame.close();
  }

  async finalize(): Promise<Blob> {
    await this.videoEncoder.flush();
    this.muxer.finalize();
    this.videoEncoder.close();
    delete this.videoEncoder;

    let { buffer } = this.muxer.target; // Buffer contains final muxed file
    return new Blob([buffer], { type: `video/${this.container}` });
  }

  close(): void {
    if (this.videoEncoder) {
      this.videoEncoder.close();
      delete this.videoEncoder;
    }
    if (this.muxer) {
      delete this.muxer;
    }
  }
} 