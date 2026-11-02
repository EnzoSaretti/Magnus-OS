/**
 * Maps Supabase Auth error codes to the message keys shown to people
 * (texts live in content/pt-BR.ts under `auth.errors`).
 */
export type AuthErrorKey =
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'weakPassword'
  | 'rateLimited'
  | 'linkExpired'
  | 'providerDisabled'
  | 'unexpected';

export function authErrorKey(code: string | undefined): AuthErrorKey {
  switch (code) {
    case 'invalid_credentials':
      return 'invalidCredentials';
    case 'email_not_confirmed':
      return 'emailNotConfirmed';
    case 'weak_password':
      return 'weakPassword';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'rateLimited';
    case 'otp_expired':
    case 'flow_state_expired':
    case 'flow_state_not_found':
    case 'bad_code_verifier':
      return 'linkExpired';
    case 'provider_disabled':
    case 'oauth_provider_not_supported':
      return 'providerDisabled';
    default:
      return 'unexpected';
  }
}
