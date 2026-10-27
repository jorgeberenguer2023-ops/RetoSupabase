export type AppRole = 'admin' | 'user';

export interface AppProfile {
  id: string;
  full_name: string;
  role: AppRole;
}

export interface Community {
  id: number;
  created_at: string;
  comunidad: string;
  numero: number;
  email: string;
  coste_mensual: number;
  junta: string;
  cancelada: boolean;
}

export type NewCommunity = Omit<Community, 'id' | 'created_at'>;
