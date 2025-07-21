import axios from 'axios';
import { API_ENDPOINTS } from '../config';

// --- Types (move to src/types/ if needed) ---
export interface TranscribeResponse {
  text: string;
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
};

export default ApiService; 