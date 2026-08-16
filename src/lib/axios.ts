import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handler hook point
    return Promise.reject(error);
  }
);

export function getServerError(
  error: unknown,
  defaultMessage = "An unexpected error occurred. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    
    if (data?.error_description) {
      return data.error_description;
    }
    
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        return data.detail[0].msg || defaultMessage;
      }
    }
    
    return error.message || defaultMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
}
