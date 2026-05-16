export enum Role {
  SOLICITANTE_OBRAS = 'SOLICITANTE_OBRAS',
  ADMINISTRACAO = 'ADMINISTRACAO',
  PCA = 'PCA'
}

export interface Company {
  id: string;
  name: string;
  created_at?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId?: string;
  companyName?: string;
}

export interface Viatura {
  id: string;
  marca: string;
  matricula: string;
  user_id: string;
  ativa: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export enum RequisitionStatus {
  RASCUNHO = 'Rascunho',
  PENDENTE_ADMIN = 'Pendente_Admin',
  PENDENTE_PCA = 'Pendente_PCA',
  APROVADO = 'Aprovado',
  REJEITADO = 'Rejeitado'
}

export enum RequisitionType {
  MATERIAL = 'MATERIAL',
  COMBUSTIVEL = 'COMBUSTIVEL'
}

export interface MaterialItem {
  material: string;
  unit: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Requisition {
  id: string;
  type: RequisitionType;
  requesterId: string;
  requesterName: string;
  date: Date;
  status: RequisitionStatus;
  
  // Specific to Material
  destinationWork?: string;
  items?: MaterialItem[];
  
  // Specific to Combustivel
  vehicleId?: string;
  currentKm?: number;
  liters?: number;
  
  // Workflow
  rejectionReason?: string;
  totalValue: number;
}

export enum FacturaEstado {
  PENDENTE = 'Pendente',
  PAGA = 'Paga',
  CANCELADA = 'Cancelada'
}

export interface Factura {
  id: string;
  numero: string;
  valor: number;
  estado: FacturaEstado;
  dataCriacao: Date;
  clientId?: string;
  clientName?: string;
  clientEntidade?: string;
  clientNuit?: string;
  clientEndereco?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  entidade: string;
  nuit: string;
  endereco: string;
  dataCriacao: Date;
}

export enum FaltaStatus {
  PENDENTE = 'Pendente',
  APROVADO = 'Aprovado',
  REJEITADO = 'Rejeitado'
}

export interface Falta {
  id: string;
  requesterId: string;
  requesterName?: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: FaltaStatus;
  rejectionReason?: string;
  createdAt: Date;
}
