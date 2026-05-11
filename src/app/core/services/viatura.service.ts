import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Viatura } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ViaturaService {
  private supabase = inject(SupabaseService);

  async getMinhasViaturas() {
    const { data, error } = await this.supabase.client
      .from('viaturas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Viatura[];
  }

  async getViaturasAtivas() {
    const { data, error } = await this.supabase.client
      .from('viaturas')
      .select('*')
      .eq('ativa', true)
      .order('marca', { ascending: true });
    
    if (error) throw error;
    return data as Viatura[];
  }

  async cadastrarViatura(viatura: Omit<Viatura, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase.client
      .from('viaturas')
      .insert(viatura)
      .select()
      .single();
    
    if (error) throw error;
    return data as Viatura;
  }

  async atualizarViatura(id: string, updates: Partial<Viatura>) {
    const { data, error } = await this.supabase.client
      .from('viaturas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Viatura;
  }

  async excluirViatura(id: string) {
    const { error } = await this.supabase.client
      .from('viaturas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async checkMatriculaExistente(matricula: string, excludeId?: string) {
    let query = this.supabase.client
      .from('viaturas')
      .select('id')
      .eq('matricula', matricula.toUpperCase());
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0;
  }
}
