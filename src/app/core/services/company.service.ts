import { Injectable, inject } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { Company, User, Role } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private supabase = inject(SupabaseService);

  async getCompanies(): Promise<Company[]> {
    const { data, error } = await this.supabase.client
      .from('companies')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Company[];
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id, name, role, company_id');
    
    if (error) throw error;

    return data.map(p => ({
      id: p.id,
      email: '', // Email typically in auth.users, requires service role to fetch for all
      name: p.name,
      role: p.role as Role,
      companyId: p.company_id
    }));
  }

  async addUser(userData: { name: string, email: string, role: Role, companyId: string }): Promise<void> {
    // Para criar um utilizador sem deslogar o PCA, criamos um cliente temporário 
    // com persistSession: false.
    const tempSupabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
      email: userData.email,
      password: 'SenhaTemporaria123!', // Senha padrão inicial
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          company_id: userData.companyId
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // Inserimos o perfil na tabela 'profiles'
      const { error: profileError } = await this.supabase.client
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email, // Adicionado para resolver a restrição NOT NULL
          role: userData.role,
          company_id: userData.companyId
        });
      
      // Ignoramos erro de duplicado (caso exista um trigger no banco que já criou o perfil)
      if (profileError && profileError.code !== '23505') throw profileError;
    }
  }

  async updateUser(userId: string, updates: { name: string, role: Role, companyId: string }): Promise<void> {
    const { error } = await this.supabase.client
      .from('profiles')
      .update({
        name: updates.name,
        role: updates.role,
        company_id: updates.companyId
      })
      .eq('id', userId);
    
    if (error) throw error;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  }
}
