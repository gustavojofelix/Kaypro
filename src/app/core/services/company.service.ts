import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Company, User, Role } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private supabase = inject(SupabaseService);

  async getCompanies(): Promise<Company[]> {
    // Return initial companies as requested
    // In a real app, this would fetch from a 'companies' table
    return [
      { id: '1', name: 'Kayconect' },
      { id: '2', name: 'Procon' }
    ];
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id, name, role, company_id');
    
    if (error) throw error;

    // Fetch auth emails if possible, or just use placeholder
    // In Supabase, getting emails for all users usually requires service role key
    // For now, we'll return what we have in profiles
    return data.map(p => ({
      id: p.id,
      email: '', // Not stored in profiles by default
      name: p.name,
      role: p.role as Role,
      companyId: p.company_id
    }));
  }

  async addUser(userData: { name: string, email: string, role: Role, companyId: string }): Promise<void> {
    // Note: To create a user with email/password in Supabase from frontend,
    // we normally use auth.signUp. But if PCA is creating for others,
    // they might not want to log out.
    // Standard approach: use a supabase edge function or service role.
    // For this demo/task, we'll assume we can use signUp or just create the profile
    // if the user already exists in auth.
    
    // Simplification for the task: we'll simulate the creation.
    // In a real scenario, this would involve a call to a management API.
    
    const { data: authData, error: authError } = await this.supabase.client.auth.admin.createUser({
      email: userData.email,
      password: 'TemporaryPassword123!', // Should be changed by user
      email_confirm: true,
      user_metadata: { name: userData.name }
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await this.supabase.client
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: userData.name,
          role: userData.role,
          company_id: userData.companyId
        });
      
      if (profileError) throw profileError;
    }
  }
}
