/** Entidades do MeuRebanho — espelham o schema do Supabase */

export type AnimalCategory = 'vaca' | 'touro' | 'bezerro' | 'bezerra' | 'novilha' | 'garrote' | 'outro'
export type AnimalStatus = 'ativo' | 'vendido' | 'morto' | 'transferido'
export type VaccinationStatus = 'pendente' | 'concluida' | 'atrasada' | 'cancelada'
export type OccurrenceType = 'bicheira' | 'mastite' | 'casco' | 'parto' | 'outro'
export type Severity = 'leve' | 'moderada' | 'grave'
export type OccurrenceStatus = 'em_andamento' | 'resolvido'
export type EmployeeStatus = 'ativo' | 'inativo'

export interface Animal {
  id: string
  property_id: string
  brinco: string
  nome?: string
  categoria?: AnimalCategory
  sexo?: 'M' | 'F'
  raca?: string
  pelagem?: string
  data_nascimento?: string
  mae_id?: string
  pai_id?: string
  foto_url?: string
  status?: AnimalStatus
  observacoes?: string
  created_at: string
}

export interface Vaccination {
  id: string
  property_id: string
  campaign_name: string
  scheduled_date: string
  applied_date?: string
  lot_number?: string
  doses_applied?: number
  status: VaccinationStatus
  notes?: string
}

export interface Occurrence {
  id: string
  animal_id: string
  property_id: string
  type: OccurrenceType
  severity: Severity
  description?: string
  photo_url?: string
  reported_by?: string
  status: OccurrenceStatus
  opened_at: string
  resolved_at?: string
}

export interface Employee {
  id: string
  property_id: string
  full_name: string
  role: string
  phone?: string
  email?: string
  status: EmployeeStatus
}

export interface TimeEntry {
  id: string
  employee_id: string
  property_id: string
  date: string
  check_in: string
  check_out?: string
  latitude_in?: number
  longitude_in?: number
}

export interface Property {
  id: string
  name: string
  state?: string
  city?: string
  area_hectares?: number
  establishment_code?: string
  car?: string
  state_registration?: string
}

export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  photo_url?: string
  property_id?: string
}

/** Labels para exibição na UI */
/** Labels para exibição na UI */
export const ANIMAL_CATEGORY_LABELS: Record<string, string> = {
  COW: 'Vaca',
  BULL: 'Touro',
  CALF_M: 'Bezerro',
  CALF_F: 'Bezerra',
  HEIFER: 'Novilha',
  STEER: 'Garrote',
  OTHER: 'Outro',
  vaca: 'Vaca',
  touro: 'Touro',
  bezerro: 'Bezerro',
  bezerra: 'Bezerra',
  novilha: 'Novilha',
  garrote: 'Garrote',
  outro: 'Outro',
}

export const ANIMAL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  SOLD: 'Vendido',
  DEAD: 'Morto',
  TRANSFERRED: 'Transferido',
  ativo: 'Ativo',
  vendido: 'Vendido',
  morto: 'Morto',
  transferido: 'Transferido',
}

export const OCCURRENCE_TYPE_LABELS: Record<string, string> = {
  bicheira: 'Bicheira',
  mastite: 'Mastite',
  casco: 'Casco',
  parto: 'Parto',
  outro: 'Outro',
}

export const SEVERITY_LABELS: Record<string, string> = {
  leve: 'Leve',
  moderada: 'Moderada',
  grave: 'Grave',
}

export const VACCINATION_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
  cancelada: 'Cancelada',
}
