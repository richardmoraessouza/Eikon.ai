export interface PopularCharacter {
  id: number;
  public_id?: string;
  nome: string;
  fotoia: string;
  bio?: string;
  usuario_id: number;
  tipo_personagem: string;
  visualizacoes: number;
  quantidade_favoritos: number;
  score_popularidade: number;
  total_messages?: number;
  total_likes?: number;
  total_conversation_time_minutes?: number;
}