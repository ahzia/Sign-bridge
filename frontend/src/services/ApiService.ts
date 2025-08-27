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
  async get(endpoint: string): Promise<any> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${endpoint}`, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw new Error(`Failed to fetch ${endpoint}. Please check if the backend is running.`);
    }
  },

  async post(endpoint: string, data?: any): Promise<any> {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${endpoint}`, data, {
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw new Error(`Failed to post to ${endpoint}. Please check if the backend is running.`);
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  },

  async transcribe(audioBlob: Blob): Promise<TranscribeResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.mp3');
      const response = await axios.post<TranscribeResponse>(
        API_ENDPOINTS.TRANSCRIBE,
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000 // 30 second timeout for transcription
        }
      );
      return response.data;
    } catch (error) {
      console.error('Transcription failed:', error);
      throw new Error('Failed to transcribe audio. Please check if the backend is running.');
    }
  },

  async simplifyText(text: string): Promise<SimplifyTextResponse> {
    try {
      const response = await axios.post<SimplifyTextResponse>(
        API_ENDPOINTS.SIMPLIFY_TEXT,
        { text },
        { timeout: 15000 } // 15 second timeout
      );
      return response.data;
    } catch (error) {
      console.error('Text simplification failed:', error);
      throw new Error('Failed to simplify text. Please check if the backend is running.');
    }
  },

  async translateSignWriting(text: string): Promise<TranslateSignWritingResponse> {
    try {
      const response = await axios.post<TranslateSignWritingResponse>(
        API_ENDPOINTS.TRANSLATE_SIGNWRITING,
        { text },
        { timeout: 20000 } // 20 second timeout
      );
      return response.data;
    } catch (error) {
      console.error('SignWriting translation failed:', error);
      throw new Error('Failed to translate to SignWriting. Please check if the backend is running.');
    }
  },

  async generatePose(text: string, spoken_language = 'en', signed_language = 'ase'): Promise<GeneratePoseResponse> {
    try {
      const response = await axios.post<GeneratePoseResponse>(
        API_ENDPOINTS.GENERATE_POSE,
        { text, spoken_language, signed_language },
        { 
          responseType: 'json',
          timeout: 25000 // 25 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Pose generation failed:', error);
      throw new Error('Failed to generate pose. Please check if the backend is running.');
    }
  },
};

export default ApiService; 