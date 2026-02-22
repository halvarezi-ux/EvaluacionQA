export interface User {
  id: number;
  name: string;
  user: string;
  email: string;
  role_id: number;
  role: Role;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  nombre: string;
  active: boolean;
  users_count?: number;
}

export interface CreateUserDto {
  name: string;
  user: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  active: boolean;
}

export interface UpdateUserDto {
  name?: string;
  user?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role_id?: number;
  active?: boolean;
}
