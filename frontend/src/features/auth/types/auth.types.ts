export interface LoginCredentials {
  username: string; // Puede ser username o email
  password: string;
}

export interface RegisterData {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}
