export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_verified: boolean;
  is_active: boolean;
  phone_number?: string;
  roles?: string[];
  permissions?: string[];
  organization_id?: string;
  department_id?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  type: 'access' | 'refresh';
}
