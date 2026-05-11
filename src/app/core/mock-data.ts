import { Vehicle, Requisition, RequisitionType, RequisitionStatus } from './models';

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', plate: 'AGQ-123-MC', model: 'Toyota Hilux', lastKm: 12500 },
  { id: 'v2', plate: 'AIZ-456-MC', model: 'Ford Ranger', lastKm: 8300 }
];

export const MOCK_REQUISITIONS: Requisition[] = [
  {
    id: 'REQ-001',
    type: RequisitionType.MATERIAL,
    requesterId: 'u1',
    requesterName: 'João Solicitante',
    date: new Date('2026-05-01T10:00:00'),
    status: RequisitionStatus.PENDENTE_ADMIN,
    destinationWork: 'Obra X - Maputo',
    items: [
      { material: 'Cimento 42.5', unit: 'Saco', quantity: 50, unitCost: 450, total: 22500 },
      { material: 'Ferro 12mm', unit: 'Varão', quantity: 20, unitCost: 300, total: 6000 }
    ],
    totalValue: 28500
  },
  {
    id: 'REQ-002',
    type: RequisitionType.COMBUSTIVEL,
    requesterId: 'u1',
    requesterName: 'João Solicitante',
    date: new Date('2026-05-02T14:30:00'),
    status: RequisitionStatus.PENDENTE_PCA, // passou na admin porque o limite pode ser > 5000 MT? 
    vehicleId: 'v1',
    currentKm: 12600,
    liters: 50,
    totalValue: 4250
  }
];
