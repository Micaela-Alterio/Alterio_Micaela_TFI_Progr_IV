export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user' | string;
  disabled: boolean;
  created_at?: string;
}
