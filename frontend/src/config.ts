// Frontend configuration for SignBridge

interface Config {
  // Backend API Configuration
  BACKEND_URL: string;
  
  // Feature Flags
  ENABLE_TEXT_SIMPLIFICATION: boolean;
  ENABLE_POSE_GENERATION: boolean;
  ENABLE_SYSTEM_AUDIO: boolean;
  
  // UI Configuration
  DEFAULT_SIGN_SIZE: number;
  MAX_RECORDING_TIME: number;
  ANIMATION_FPS: number;
  
  // Development Configuration
  DEBUG: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

// Load environment variables with defaults
const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvBool = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Configuration object
export const config: Config = {
  // Backend API Configuration
  BACKEND_URL: getEnvVar('VITE_BACKEND_URL', 'http://127.0.0.1:8000'),
  
  // Feature Flags
  ENABLE_TEXT_SIMPLIFICATION: getEnvBool('VITE_ENABLE_TEXT_SIMPLIFICATION', true),
  ENABLE_POSE_GENERATION: getEnvBool('VITE_ENABLE_POSE_GENERATION', true),
  ENABLE_SYSTEM_AUDIO: getEnvBool('VITE_ENABLE_SYSTEM_AUDIO', true),
  
  // UI Configuration
  DEFAULT_SIGN_SIZE: getEnvNumber('VITE_DEFAULT_SIGN_SIZE', 24),
  MAX_RECORDING_TIME: getEnvNumber('VITE_MAX_RECORDING_TIME', 300), // 5 minutes
  ANIMATION_FPS: getEnvNumber('VITE_ANIMATION_FPS', 30),
  
  // Development Configuration
  DEBUG: getEnvBool('VITE_DEBUG', import.meta.env.DEV),
  LOG_LEVEL: (getEnvVar('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error') || 'info',
};

// Validation function
export const validateConfig = (): void => {
  const warnings: string[] = [];
  
  if (!config.BACKEND_URL) {
    warnings.push('BACKEND_URL is not set. API calls will fail.');
  }
  
  if (!config.ENABLE_TEXT_SIMPLIFICATION) {
    warnings.push('Text simplification is disabled.');
  }
  
  if (!config.ENABLE_POSE_GENERATION) {
    warnings.push('Pose generation is disabled.');
  }
  
  if (warnings.length > 0) {
    console.warn('Configuration warnings:', warnings);
  }
};

// API endpoints
export const API_ENDPOINTS = {
  TRANSCRIBE: `${config.BACKEND_URL}/transcribe`,
  SIMPLIFY_TEXT: `${config.BACKEND_URL}/simplify_text`,
  TRANSLATE_SIGNWRITING: `${config.BACKEND_URL}/translate_signwriting`,
  GENERATE_POSE: `${config.BACKEND_URL}/generate_pose`,
} as const;

// Validate configuration on import
validateConfig();

export default config; 