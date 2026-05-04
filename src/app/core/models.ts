export enum Role {
  SOLICITANTE_OBRAS = 'SOLICITANTE_OBRAS',
  ADMINISTRACAO = 'ADMINISTRACAO',
  PCA = 'PCA'
}

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  lastKm: number;
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
