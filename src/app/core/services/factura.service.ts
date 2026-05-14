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
      .select('*, clientes(*)')
      .order('data_criacao', { ascending: false });

    if (data && !error) {
      const facturas: Factura[] = (data as any[]).map((row: any) => ({
        id: row['id'],
        numero: row['numero'],
        valor: Number(row['valor']),
        estado: row['estado'] as FacturaEstado,
        dataCriacao: new Date(row['data_criacao']),
        clientId: row['client_id'],
        clientName: row['clientes']?.nome,
        clientEntidade: row['clientes']?.entidade,
        clientNuit: row['clientes']?.nuit,
        clientEndereco: row['clientes']?.endereco
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
        estado: factura.estado,
        client_id: factura.clientId
      })
      .select('*, clientes(*)')
      .single();

    if (error) {
      return { error: error.message };
    }

    if (data) {
      const row = data as any;
      const novaFactura: Factura = {
        id: row['id'],
        numero: row['numero'],
        valor: Number(row['valor']),
        estado: row['estado'] as FacturaEstado,
        dataCriacao: new Date(row['data_criacao']),
        clientId: row['client_id'],
        clientName: row['clientes']?.nome,
        clientEntidade: row['clientes']?.entidade,
        clientNuit: row['clientes']?.nuit,
        clientEndereco: row['clientes']?.endereco
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
