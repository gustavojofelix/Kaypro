import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { AbsenceService } from '../../core/services/absence.service';
import { AuthService } from '../../core/services/auth.service';
import { Falta, FaltaStatus } from '../../core/models';
import { FaltaFormModalComponent } from './falta-form-modal/falta-form-modal.component';

@Component({
  selector: 'app-faltas-list',
  standalone: true,
  imports: [CommonModule, FaltaFormModalComponent],
  template: `
    <div class="min-h-screen bg-gray-50/30 p-4 sm:p-8">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Controle de Faltas</h1>
            </div>
            <p class="text-gray-500 font-medium ml-1">Gestão de avisos de ausência e justificações.</p>
          </div>
          <button (click)="openModal()" 
                  class="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-200 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Aviso de Falta
          </button>
        </div>
      </header>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-md">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Pendentes</span>
          </div>
          <p class="text-2xl font-black text-gray-900">{{ pendingCount() }}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-md">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Aprovados</span>
          </div>
          <p class="text-2xl font-black text-gray-900">{{ approvedCount() }}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-md">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Rejeitados</span>
          </div>
          <p class="text-2xl font-black text-gray-900">{{ rejectedCount() }}</p>
        </div>
      </div>

      <!-- Main Table -->
      <main class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div class="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
          <div class="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h3 class="text-lg font-black text-gray-900">Meus Avisos de Falta</h3>
        </div>

        <!-- Desktop Table -->
        <div class="overflow-x-auto hidden sm:block">
          <table class="min-w-full divide-y divide-gray-100">
            <thead>
              <tr>
                <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Período</th>
                <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Dias</th>
                <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Motivo</th>
                <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Observação</th>
                <th class="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Data Pedido</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let falta of myAbsences$ | async" class="hover:bg-gray-50/80 transition-all duration-200">
                <td class="px-6 py-4">
                  <div class="text-sm font-bold text-gray-900">{{falta.startDate | date:'dd/MM/yyyy'}}</div>
                  <div class="text-xs text-gray-400 mt-0.5">até {{falta.endDate | date:'dd/MM/yyyy'}}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-lg">
                    {{ calcDays(falta) }} dia(s)
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600 max-w-xs line-clamp-2">{{falta.reason}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider inline-flex items-center"
                        [ngClass]="{
                          'bg-amber-50 text-amber-700 border border-amber-100': falta.status === 'Pendente',
                          'bg-emerald-50 text-emerald-700 border border-emerald-100': falta.status === 'Aprovado',
                          'bg-rose-50 text-rose-700 border border-rose-100': falta.status === 'Rejeitado'
                        }">
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5"
                          [ngClass]="{
                            'bg-amber-500': falta.status === 'Pendente',
                            'bg-emerald-500': falta.status === 'Aprovado',
                            'bg-rose-500': falta.status === 'Rejeitado'
                          }"></span>
                    {{falta.status}}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 italic max-w-[200px] truncate">
                  {{falta.rejectionReason || '—'}}
                </td>
                <td class="px-6 py-4 text-right text-xs text-gray-400">
                  {{falta.createdAt | date:'dd/MM/yyyy HH:mm'}}
                </td>
              </tr>
              <tr *ngIf="(myAbsences$ | async)?.length === 0">
                <td colspan="6" class="py-20 text-center">
                  <div class="flex flex-col items-center">
                    <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h4 class="text-base font-bold text-gray-900 mb-1">Nenhum aviso registado</h4>
                    <p class="text-sm text-gray-500">Clique em "Novo Aviso de Falta" para criar o primeiro.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="sm:hidden divide-y divide-gray-100">
          <div *ngFor="let falta of myAbsences$ | async" class="p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-sm font-bold text-gray-900">
                  {{falta.startDate | date:'dd/MM/yyyy'}} — {{falta.endDate | date:'dd/MM/yyyy'}}
                </div>
                <span class="text-xs text-blue-600 font-bold">{{ calcDays(falta) }} dia(s)</span>
              </div>
              <span class="px-2.5 py-1 text-[10px] font-black rounded-lg uppercase"
                    [ngClass]="{
                      'bg-amber-50 text-amber-700': falta.status === 'Pendente',
                      'bg-emerald-50 text-emerald-700': falta.status === 'Aprovado',
                      'bg-rose-50 text-rose-700': falta.status === 'Rejeitado'
                    }">
                {{falta.status}}
              </span>
            </div>
            <div class="text-sm text-gray-600">
              <strong class="text-gray-700">Motivo:</strong> {{falta.reason}}
            </div>
            <div *ngIf="falta.rejectionReason" class="text-xs text-rose-600 italic bg-rose-50 px-3 py-1.5 rounded-lg">
              Obs: {{falta.rejectionReason}}
            </div>
          </div>
          <div *ngIf="(myAbsences$ | async)?.length === 0" class="p-8 text-sm text-center text-gray-500">
            Nenhum aviso registado.
          </div>
        </div>
      </main>
    </div>

    <app-falta-form-modal 
      *ngIf="showModal()" 
      (close)="closeModal()">
    </app-falta-form-modal>
  `
})
export class FaltasListComponent implements OnInit {
  private absenceService = inject(AbsenceService);
  private authService = inject(AuthService);

  showModal = signal(false);

  async ngOnInit() {
    await this.absenceService.loadAbsences();
  }

  // Filter only current user's absences
  myAbsences$ = this.absenceService.absences$.pipe(
    map(abs => abs.filter(a => a.requesterId === this.authService.currentUserValue?.id))
  );

  pendingCount = signal(0);
  approvedCount = signal(0);
  rejectedCount = signal(0);

  constructor() {
    this.absenceService.absences$.pipe(
      map(abs => abs.filter(a => a.requesterId === this.authService.currentUserValue?.id))
    ).subscribe(mine => {
      this.pendingCount.set(mine.filter(a => a.status === FaltaStatus.PENDENTE).length);
      this.approvedCount.set(mine.filter(a => a.status === FaltaStatus.APROVADO).length);
      this.rejectedCount.set(mine.filter(a => a.status === FaltaStatus.REJEITADO).length);
    });
  }

  calcDays(falta: Falta): number {
    const diff = new Date(falta.endDate).getTime() - new Date(falta.startDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }
}
