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
  /** Present when status is 'expired' or 'cancelled' — RFC-compliant callback URL to return the user to their app. */
  redirect_url?: string | null;
}

export interface OAuthRedirectResponse {
  redirect_url: string;
}

export interface OAuthFlowResponse {
  detail?: string;
  redirect_url?: string | null;
  email_verification_required?: boolean;
}
