import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbsenceService } from '../../core/services/absence.service';
import { AuthService } from '../../core/services/auth.service';
import { Falta, Role } from '../../core/models';
import { FaltaFormModalComponent } from './falta-form-modal/falta-form-modal.component';

@Component({
  selector: 'app-faltas-list',
  standalone: true,
  imports: [CommonModule, FaltaFormModalComponent],
  template: `
    <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
        Controle de Faltas
      </h2>
      <button (click)="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors text-center sm:w-auto w-full">
        Novo Aviso de Falta
      </button>
    </div>

    <div class="bg-white shadow overflow-hidden rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 hidden sm:table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Início</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fim</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let falta of myAbsences$ | async">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{falta.startDate | date:'dd/MM/yyyy'}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{falta.endDate | date:'dd/MM/yyyy'}}</td>
              <td class="px-4 sm:px-6 py-4 text-sm text-gray-500">{{falta.reason}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': falta.status === 'Pendente',
                        'bg-green-100 text-green-800': falta.status === 'Aprovado',
                        'bg-red-100 text-red-800': falta.status === 'Rejeitado'
                      }">
                  {{falta.status}}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 text-sm text-gray-500 text-right italic">
                {{falta.rejectionReason || '-'}}
              </td>
            </tr>
            <tr *ngIf="(myAbsences$ | async)?.length === 0">
              <td colspan="5" class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Nenhum registro de falta encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sm:hidden divide-y divide-gray-200">
        <div *ngFor="let falta of myAbsences$ | async" class="p-4 space-y-2">
          <div class="flex justify-between items-start">
            <span class="text-sm font-medium text-gray-900">{{falta.startDate | date:'dd/MM/yyyy'}} - {{falta.endDate | date:'dd/MM/yyyy'}}</span>
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': falta.status === 'Pendente',
                    'bg-green-100 text-green-800': falta.status === 'Aprovado',
                    'bg-red-100 text-red-800': falta.status === 'Rejeitado'
                  }">
              {{falta.status}}
            </span>
          </div>
          <div class="text-sm text-gray-500">
            <strong>Motivo:</strong> {{falta.reason}}
          </div>
          <div *ngIf="falta.rejectionReason" class="text-xs text-red-600 italic">
            Obs: {{falta.rejectionReason}}
          </div>
        </div>
        <div *ngIf="(myAbsences$ | async)?.length === 0" class="p-4 text-sm text-center text-gray-500">
          Nenhum registro de falta encontrado.
        </div>
      </div>
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

  myAbsences$ = this.absenceService.absences$;

  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }
}
