export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};
