export interface PublicApplicationConfig {
  name: string;
  description?: string | null;
  logo_url?: string | null;
  logo_with_text?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  allow_signup: boolean;
  allow_password_login: boolean;
  require_email_verification: boolean;
  allowed_scopes: string[];
}

export interface AuthSessionResponse {
  session_id: string;
  status: 'pending' | 'authenticated' | 'completed' | 'cancelled' | 'expired';
  application: PublicApplicationConfig;
  scopes: string[];
}

export interface OAuthRedirectResponse {
  redirect_url: string;
}

export interface OAuthFlowResponse {
  detail: string;
}
