import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Factura, FacturaEstado } from '../models';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private supabaseService = inject(SupabaseService);
  private facturasSubject = new BehaviorSubject<Factura[]>([]);
  public facturas$ = this.facturasSubject.asObservable();

  async loadFacturas(): Promise<void> {
    const { data, error } = await this.supabaseService.client
      .from('facturas')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (data && !error) {
      const facturas: Factura[] = data.map((row: any) => ({
        id: row.id,
        numero: row.numero,
        valor: Number(row.valor),
        estado: row.estado as FacturaEstado,
        dataCriacao: new Date(row.data_criacao)
      }));
      this.facturasSubject.next(facturas);
    }
  }

  async addFactura(factura: Omit<Factura, 'id' | 'dataCriacao'>): Promise<{ error: string | null }> {
    const { data, error } = await this.supabaseService.client
      .from('facturas')
      .insert({
        numero: factura.numero,
        valor: factura.valor,
        estado: factura.estado
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    if (data) {
      const novaFactura: Factura = {
        id: data.id,
        numero: data.numero,
        valor: Number(data.valor),
        estado: data.estado as FacturaEstado,
        dataCriacao: new Date(data.data_criacao)
      };
      const current = this.facturasSubject.value;
      this.facturasSubject.next([novaFactura, ...current]);
    }

    return { error: null };
  }

  getFacturas(): Factura[] {
    return this.facturasSubject.value;
  }
}
