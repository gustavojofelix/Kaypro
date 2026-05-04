import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Requisition, RequisitionStatus, RequisitionType, Vehicle } from '../models';
import { MOCK_REQUISITIONS, MOCK_VEHICLES } from '../mock-data';

@Injectable({
  providedIn: 'root'
})
export class RequisitionService {
  private requisitionsSubject = new BehaviorSubject<Requisition[]>([...MOCK_REQUISITIONS]);
  public requisitions$ = this.requisitionsSubject.asObservable();

  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([...MOCK_VEHICLES]);
  public vehicles$ = this.vehiclesSubject.asObservable();

  constructor() {}

  getRequisitions(): Requisition[] {
    return this.requisitionsSubject.value;
  }

  addRequisition(req: Requisition): void {
    const current = this.getRequisitions();
    req.id = 'REQ-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.requisitionsSubject.next([req, ...current]);
    
    if (req.vehicleId && req.currentKm) {
        this.updateVehicleKm(req.vehicleId, req.currentKm);
    }
  }

  updateStatus(id: string, newStatus: RequisitionStatus, reason?: string): void {
    const current = this.getRequisitions();
    const updated = current.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus, rejectionReason: reason };
      }
      return req;
    });
    this.requisitionsSubject.next(updated);
  }

  getVehicle(id: string): Vehicle | undefined {
    return this.vehiclesSubject.value.find(v => v.id === id);
  }
  
  updateVehicleKm(id: string, newKm: number): void {
      const current = this.vehiclesSubject.value;
      const updated = current.map(v => {
          if (v.id === id) {
              return { ...v, lastKm: newKm };
          }
          return v;
      });
      this.vehiclesSubject.next(updated);
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
        .filter(r => r.type === RequisitionType.COMBUSTIVEL)
        .reduce((sum, r) => sum + (r.liters || 0), 0)
      )
    );
  }

  getSpendsByWork(): Observable<{work: string, total: number}[]> {
    return this.requisitions$.pipe(
      map(reqs => {
        const spends: Record<string, number> = {};
        reqs.filter(r => r.type === RequisitionType.MATERIAL && r.destinationWork)
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
        reqs.filter(r => r.type === RequisitionType.COMBUSTIVEL && r.vehicleId)
            .forEach(r => {
              const vehicle = this.getVehicle(r.vehicleId!);
              if (vehicle) {
                consumption[vehicle.plate] = (consumption[vehicle.plate] || 0) + (r.liters || 0);
              }
            });
        
        return Object.keys(consumption).map(key => ({
          plate: key,
          liters: consumption[key]
        })).sort((a, b) => b.liters - a.liters);
      })
    );
  }
}
