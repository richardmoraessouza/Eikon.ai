export interface DailyMission {
  id: number;
  mission_id: number;
  usuario_id: number;
  progresso: number;
  completada: boolean;
  data_atribuida: string;
  tipo: string;
  titulo: string;
  descricao: string;
  objetivo: number;
  xp: number;
}

export interface ProgressResponse {
  completada: boolean;
  progresso: number;
  xpGanho: number;
  message?: string;
}