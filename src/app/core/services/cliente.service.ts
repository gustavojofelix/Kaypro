import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cliente } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private supabase = inject(SupabaseService);

  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true });
    
    if (error) throw error;
    
    return data.map(d => ({
      id: d.id,
      nome: d.nome,
      entidade: d.entidade,
      nuit: d.nuit,
      endereco: d.endereco,
      dataCriacao: new Date(d.data_criacao)
    }));
  }

  async cadastrarCliente(cliente: Omit<Cliente, 'id' | 'dataCriacao'>): Promise<Cliente> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .insert({
        nome: cliente.nome,
        entidade: cliente.entidade,
        nuit: cliente.nuit,
        endereco: cliente.endereco
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      entidade: data.entidade,
      nuit: data.nuit,
      endereco: data.endereco,
      dataCriacao: new Date(data.data_criacao)
    };
  }

  async atualizarCliente(id: string, updates: Partial<Omit<Cliente, 'id' | 'dataCriacao'>>): Promise<Cliente> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .update({
        nome: updates.nome,
        entidade: updates.entidade,
        nuit: updates.nuit,
        endereco: updates.endereco
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      entidade: data.entidade,
      nuit: data.nuit,
      endereco: data.endereco,
      dataCriacao: new Date(data.data_criacao)
    };
  }

  async excluirCliente(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('clientes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
