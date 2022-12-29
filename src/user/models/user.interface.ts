import { UserRole } from 'src/auth/models/role.enum';

export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
