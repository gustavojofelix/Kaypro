import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbsenceService } from '../../../core/services/absence.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-falta-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-800">Novo Aviso de Falta</h3>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="submit()" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Data Início</label>
              <input type="date" [(ngModel)]="startDate" name="startDate" required
                     class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Data Fim</label>
              <input type="date" [(ngModel)]="endDate" name="endDate" required
                     class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Motivo / Justificação</label>
            <textarea [(ngModel)]="reason" name="reason" rows="4" required
                      placeholder="Descreva o motivo da ausência..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"></textarea>
          </div>

          <div class="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" (click)="close.emit()"
                    class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="loading()"
                    class="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {{ loading() ? 'Enviando...' : 'Enviar Aviso' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
  `]
})
export class FaltaFormModalComponent {
  @Output() close = new EventEmitter<void>();

  private absenceService = inject(AbsenceService);
  private authService = inject(AuthService);

  startDate: string = '';
  endDate: string = '';
  reason: string = '';
  loading = signal(false);

  async submit() {
    if (!this.startDate || !this.endDate || !this.reason) return;

    this.loading.set(true);
    try {
      await this.absenceService.addAbsence({
        requesterId: this.authService.currentUserValue?.id!,
        startDate: new Date(this.startDate),
        endDate: new Date(this.endDate),
        reason: this.reason
      });
      this.close.emit();
    } catch (error) {
      console.error('Erro ao enviar aviso de falta:', error);
      alert('Ocorreu um erro ao enviar o aviso. Verifique se a tabela "faltas" existe no Supabase.');
    } finally {
      this.loading.set(false);
    }
  }
}
