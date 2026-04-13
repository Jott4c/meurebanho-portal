/** Entidades do MeuRebanho — espelham o schema do Supabase */

export type AnimalCategory = 'vaca' | 'touro' | 'novilha' | 'novilho' | 'bezerro' | 'bezerra'
export type AnimalStatus = 'active' | 'sold' | 'dead'
export type VaccinationStatus = 'pending' | 'completed' | 'overdue' | 'cancelled'
export type OccurrenceType = 'vacinacao' | 'vermifugacao' | 'doenca' | 'bicheira' | 'mastite' | 'casco' | 'ferimento' | 'cio' | 'inseminacao' | 'prenhez' | 'parto' | 'aborto' | 'desmama' | 'pesagem' | 'morte' | 'outro'
export type Severity = 'leve' | 'moderado' | 'grave'
export type OccurrenceStatus = 'open' | 'resolved'
export type EmployeeStatus = 'active' | 'inactive'

export interface Animal {
  id: string
  property_id: string
  ear_tag: string
  category: AnimalCategory
  sex: 'M' | 'F'
  breed?: string
  color?: string
  birth_date?: string
  mother_id?: string
  father_id?: string
  photo_url?: string
  status: AnimalStatus
  status_date?: string
  status_reason?: string
  paddock_id?: string
  paddock?: string
  paddock_entry_date?: string
  rfid_tag?: string
  visual_id?: string
  pnib_id?: string
  batch_id?: string
  withdrawal_until?: string
  created_at: string
  updated_at: string
}

export interface Vaccination {
  id: string
  property_id: string
  vaccine_type: string
  campaign_id?: string
  application_date: string
  animals_count: number
  vaccine_batch?: string
  invoice_url?: string
  notes?: string
  created_at: string
}

export interface Occurrence {
  id: string
  property_id: string
  animal_id?: string
  employee_id?: string
  occurrence_type: OccurrenceType
  severity?: Severity
  description?: string
  photo_url?: string
  occurred_at: string
  resolved: boolean
  resolved_at?: string
}

export interface Employee {
  id: string
  property_id: string
  user_id?: string
  name: string
  role?: string
  phone?: string
  daily_hours?: number
  active: boolean
  created_at: string
}

export interface TimeEntry {
  id: string
  employee_id: string
  property_id: string
  clock_in: string
  clock_out?: string
  clock_in_lat?: number
  clock_in_lng?: number
  clock_out_lat?: number
  clock_out_lng?: number
  is_within_geofence?: boolean
  notes?: string
}

export interface Paddock {
  id: string
  property_id: string
  name: string
  area?: number
  capacity?: number
  last_vacated_at?: string
  animal_count?: number
  last_entry_date?: string
  created_at: string
}

export interface Property {
  id: string
  user_id: string
  name: string
  state_code: string
  city?: string
  inscricao_estadual?: string
  total_area_hectares?: number
  pasture_area_hectares?: number
  latitude?: number
  longitude?: number
  geofence_radius_meters?: number
  pnib_score?: number
}

export interface UserProfile {
  id: string
  email?: string
  phone?: string
  full_name: string
  cpf_cnpj?: string
  avatar_url?: string
  plan: 'free' | 'basic' | 'professional' | 'farm' | 'unlimited'
  whatsapp_opt_in: boolean
  push_token?: string
  created_at: string
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
  vacinacao: 'Vacinação',
  vermifugacao: 'Vermifugação',
  doenca: 'Doença/Enfermidade',
  bicheira: 'Bicheira',
  mastite: 'Mastite',
  casco: 'Problema de Casco',
  ferimento: 'Ferimento',
  cio: 'Cio Detectado',
  inseminacao: 'Inseminação',
  prenhez: 'Diagnóstico de Prenhez',
  parto: 'Parto',
  aborto: 'Aborto',
  desmama: 'Desmama',
  pesagem: 'Pesagem',
  morte: 'Morte',
  outro: 'Outro',
}

export const SEVERITY_LABELS: Record<string, string> = {
  leve: 'Leve',
  moderado: 'Moderada',
  grave: 'Grave',
}

export const VACCINATION_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
  cancelada: 'Cancelada',
}
