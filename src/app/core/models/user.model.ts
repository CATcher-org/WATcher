export interface User {
  loginId: string;
  role: UserRole;
}

export enum UserRole {
  Admin = 'Admin',
  Tutor = 'Tutor',
  Student = 'Student'
}
