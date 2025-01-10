import { UserResponse } from './user-response.model';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
