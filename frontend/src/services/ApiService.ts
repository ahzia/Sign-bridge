import axios from 'axios';
import { API_ENDPOINTS } from '../config';

// --- Types (move to src/types/ if needed) ---
export interface TranscribeResponse {
  text: string;
  provider?: string;
  status?: string;
}

export interface SimplifyTextResponse {
  simplified_text: string;
}

export interface TranslateSignWritingResponse {
  signwriting: string;
}

export interface GeneratePoseResponse {
  pose_data: string;
  data_format: string;
}

export interface OCRTranscribeResponse {
  recognized_text: string;
  confidence: number;
  npu_used: boolean;
  inference_time_ms: number;
  file_name: string;
  file_size: number;
  image_format: string;
  image_size: string;
  total_processing_time_ms: number;
  success: boolean;
}

export interface OCRStatusResponse {
  ocr_service: {
    initialized: boolean;
    model_loaded: boolean;
    providers_available: string[];
    qnn_available: boolean;
  };
  message: string;
}

// --- API Service ---
const ApiService = {
  async transcribe(audioBlob: Blob): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const response = await axios.post<TranscribeResponse>(
      API_ENDPOINTS.TRANSCRIBE,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async simplifyText(text: string): Promise<SimplifyTextResponse> {
    const response = await axios.post<SimplifyTextResponse>(
      API_ENDPOINTS.SIMPLIFY_TEXT,
      { text }
    );
    return response.data;
  },

  async translateSignWriting(text: string): Promise<TranslateSignWritingResponse> {
    const response = await axios.post<TranslateSignWritingResponse>(
      API_ENDPOINTS.TRANSLATE_SIGNWRITING,
      { text }
    );
    return response.data;
  },

  async generatePose(text: string, spoken_language = 'en', signed_language = 'ase'): Promise<GeneratePoseResponse> {
    const response = await axios.post<GeneratePoseResponse>(
      API_ENDPOINTS.GENERATE_POSE,
      { text, spoken_language, signed_language },
      { responseType: 'json' }
    );
    return response.data;
  },

  async ocrTranscribe(imageBlob: Blob): Promise<OCRTranscribeResponse> {
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.jpg');
    const response = await axios.post<OCRTranscribeResponse>(
      API_ENDPOINTS.OCR_TRANSCRIBE,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async ocrStatus(): Promise<OCRStatusResponse> {
    const response = await axios.get<OCRStatusResponse>(API_ENDPOINTS.OCR_STATUS);
    return response.data;
  },
};

export default ApiService; 