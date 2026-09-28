export const ROLE_NAMES = ['SUPERVISOR', 'TEACHER'] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

export interface AuthenticatedAccount {
  id: string;
  personnelCode: string;
  roles: RoleName[];
  teacher: { id: string } | null;
}
