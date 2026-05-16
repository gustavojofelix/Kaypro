import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Falta, FaltaStatus } from '../models';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private supabase = inject(SupabaseService);
  private absencesSubject = new BehaviorSubject<Falta[]>([]);
  public absences$ = this.absencesSubject.asObservable();

  async loadAbsences(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('faltas')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const absences: Falta[] = (data as any[]).map(row => ({
      id: row.id,
      requesterId: row.requester_id,
      requesterName: row.profiles?.name || 'Utilizador',
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      reason: row.reason,
      status: row.status as FaltaStatus,
      rejectionReason: row.rejection_reason,
      createdAt: new Date(row.created_at)
    }));

    this.absencesSubject.next(absences);
  }

  async addAbsence(falta: Omit<Falta, 'id' | 'requesterName' | 'status' | 'createdAt'>): Promise<void> {
    const { error } = await this.supabase.client
      .from('faltas')
      .insert({
        requester_id: falta.requesterId,
        start_date: falta.startDate,
        end_date: falta.endDate,
        reason: falta.reason,
        status: FaltaStatus.PENDENTE
      });

    if (error) throw error;

    await this.loadAbsences();
  }

  async updateStatus(id: string, newStatus: FaltaStatus, reason?: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('faltas')
      .update({ 
        status: newStatus, 
        rejection_reason: reason 
      })
      .eq('id', id);

    if (error) throw error;
    
    await this.loadAbsences();
  }

  getAbsences(): Falta[] {
    return this.absencesSubject.value;
  }
}
