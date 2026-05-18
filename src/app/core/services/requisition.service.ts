import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Requisition, RequisitionStatus, RequisitionType, MaterialItem } from '../models';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RequisitionService {
  private supabase = inject(SupabaseService);
  private requisitionsSubject = new BehaviorSubject<Requisition[]>([]);
  public requisitions$ = this.requisitionsSubject.asObservable();

  async loadRequisitions(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('requisitions')
      .select('*, requisition_items(*), profiles(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const requisitions: Requisition[] = (data as any[]).map(row => ({
      id: row.id,
      type: row.type as RequisitionType,
      requesterId: row.requester_id,
      requesterName: row.profiles?.name || 'Utilizador',
      date: new Date(row.date),
      status: row.status as RequisitionStatus,
      destinationWork: row.destination_work,
      items: (row.requisition_items as any[] || []).map(item => ({
        material: item.material,
        unit: item.unit,
        quantity: Number(item.quantity),
        unitCost: Number(item.unit_cost),
        total: Number(item.total)
      })),
      vehicleId: row.vehicle_id,
      currentKm: row.current_km,
      liters: row.liters ? Number(row.liters) : undefined,
      rejectionReason: row.rejection_reason,
      totalValue: Number(row.total_value)
    }));

    this.requisitionsSubject.next(requisitions);
  }

  async addRequisition(req: Omit<Requisition, 'id' | 'requesterName'>): Promise<void> {
    // 1. Inserir a requisição principal
    const { data: reqData, error: reqError } = await this.supabase.client
      .from('requisitions')
      .insert({
        type: req.type,
        requester_id: req.requesterId,
        date: req.date,
        status: req.status,
        total_value: req.totalValue,
        destination_work: req.destinationWork,
        vehicle_id: req.vehicleId,
        current_km: req.currentKm,
        liters: req.liters
      })
      .select()
      .single();

    if (reqError) throw reqError;

    // 2. Se for MATERIAL ou OUTROS, inserir os itens
    if ((req.type === RequisitionType.MATERIAL || req.type === RequisitionType.OUTROS) && req.items && req.items.length > 0) {
      const itemsToInsert = req.items.map(item => ({
        requisition_id: reqData.id,
        material: item.material,
        unit: item.unit,
        quantity: item.quantity,
        unit_cost: item.unitCost,
        total: item.total
      }));

      const { error: itemsError } = await this.supabase.client
        .from('requisition_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    await this.loadRequisitions();
  }

  async updateStatus(id: string, newStatus: RequisitionStatus, reason?: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('requisitions')
      .update({ 
        status: newStatus, 
        rejection_reason: reason 
      })
      .eq('id', id);

    if (error) throw error;
    
    await this.loadRequisitions();
  }

  getRequisitions(): Requisition[] {
    return this.requisitionsSubject.value;
  }

  // --- Analytics Methods ---
  
  getApprovedTotal(): Observable<number> {
    return this.requisitions$.pipe(
      map(reqs => reqs
        .filter(r => r.status === RequisitionStatus.APROVADO)
        .reduce((sum, r) => sum + r.totalValue, 0)
      )
    );
  }

  getPendingTotal(): Observable<number> {
    return this.requisitions$.pipe(
      map(reqs => reqs
        .filter(r => r.status === RequisitionStatus.PENDENTE_ADMIN || r.status === RequisitionStatus.PENDENTE_PCA)
        .reduce((sum, r) => sum + r.totalValue, 0)
      )
    );
  }

  getTotalLiters(): Observable<number> {
    return this.requisitions$.pipe(
      map(reqs => reqs
        .filter(r => r.type === RequisitionType.COMBUSTIVEL && r.status === RequisitionStatus.APROVADO)
        .reduce((sum, r) => sum + (r.liters || 0), 0)
      )
    );
  }

  getSpendsByWork(): Observable<{work: string, total: number}[]> {
    return this.requisitions$.pipe(
      map(reqs => {
        const spends: Record<string, number> = {};
        reqs.filter(r => (r.type === RequisitionType.MATERIAL || r.type === RequisitionType.OUTROS) && r.status === RequisitionStatus.APROVADO && r.destinationWork)
            .forEach(r => {
              const work = r.destinationWork!;
              spends[work] = (spends[work] || 0) + r.totalValue;
            });
        
        return Object.keys(spends).map(key => ({
          work: key,
          total: spends[key]
        })).sort((a, b) => b.total - a.total);
      })
    );
  }

  getFuelConsumptionByVehicle(): Observable<{plate: string, liters: number}[]> {
    return this.requisitions$.pipe(
      map(reqs => {
        const consumption: Record<string, number> = {};
        reqs.filter(r => r.type === RequisitionType.COMBUSTIVEL && r.status === RequisitionStatus.APROVADO && r.vehicleId)
            .forEach(r => {
              const plate = 'Viatura ' + r.vehicleId; 
              consumption[plate] = (consumption[plate] || 0) + (r.liters || 0);
            });
        
        return Object.keys(consumption).map(key => ({
          plate: key,
          liters: consumption[key]
        })).sort((a, b) => b.liters - a.liters);
      })
    );
  }
}

