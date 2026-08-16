import { api } from './axios';
import type { 
  AuthSessionResponse, 
  OAuthRedirectResponse, 
  OAuthFlowResponse 
} from '@/types/oauth';

export const oauthApi = {
  getSession: async (sessionId: string) => {
    const { data } = await api.get<AuthSessionResponse>(
      `/api/v1/auth-sessions/${sessionId}`
    );
    return data;
  },
  
  login: async (sessionId: string, credentials: Record<string, string>) => {
    const { data } = await api.post<OAuthRedirectResponse | OAuthFlowResponse>(
      `/api/v1/auth-sessions/${sessionId}/login`,
      credentials
    );
    return data;
  },

  signup: async (sessionId: string, credentials: Record<string, string>) => {
    const { data } = await api.post<OAuthRedirectResponse | OAuthFlowResponse>(
      `/api/v1/auth-sessions/${sessionId}/signup`,
      credentials
    );
    return data;
  },

  forgotPassword: async (sessionId: string, email: string) => {
    const { data } = await api.post<OAuthFlowResponse>(
      `/api/v1/auth-sessions/${sessionId}/forgot-password`,
      { email }
    );
    return data;
  },
  
  resetPassword: async (sessionId: string, credentials: Record<string, string>) => {
    const { data } = await api.post<OAuthFlowResponse>(
      `/api/v1/auth-sessions/${sessionId}/reset-password`,
      credentials
    );
    return data;
  },

  verifyEmail: async (sessionId: string, verification_token: string) => {
    const { data } = await api.post<OAuthRedirectResponse | OAuthFlowResponse>(
      `/api/v1/auth-sessions/${sessionId}/verify-email`,
      { verification_token }
    );
    return data;
  },
};
