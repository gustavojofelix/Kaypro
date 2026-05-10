import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { RequisitionService } from '../../../core/services/requisition.service';
import { RequisitionStatus } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-4 sm:mb-6 flex justify-between items-center">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Aprovação Administração (Nível 1)</h2>
    </div>

    <div class="bg-white shadow overflow-hidden rounded-lg">
      <!-- Desktop Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 hidden sm:table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let req of pendingReqs$ | async">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{req.id}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.requesterName}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.type}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{{req.totalValue | currency:'MZN':'symbol-narrow'}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="approve(req.id, req.totalValue)" class="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md mr-2 transition-colors shadow-sm">
                  Aprovar
                </button>
                <button (click)="reject(req.id)" class="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors shadow-sm">
                  Rejeitar
                </button>
              </td>
            </tr>
            <tr *ngIf="(pendingReqs$ | async)?.length === 0">
              <td colspan="5" class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Nenhuma requisição pendente.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="sm:hidden divide-y divide-gray-200">
        <div *ngFor="let req of pendingReqs$ | async" class="p-4 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-sm font-medium text-gray-900">{{req.id}}</span>
              <p class="text-xs text-gray-500 mt-0.5">{{req.requesterName}}</p>
            </div>
            <span class="text-sm font-semibold text-gray-900">{{req.totalValue | currency:'MZN':'symbol-narrow'}}</span>
          </div>
          <div class="text-xs text-gray-500">{{req.type}}</div>
          <div class="flex gap-2">
            <button (click)="approve(req.id, req.totalValue)" class="flex-1 text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md transition-colors shadow-sm text-sm font-medium">
              Aprovar
            </button>
            <button (click)="reject(req.id)" class="flex-1 text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md transition-colors shadow-sm text-sm font-medium">
              Rejeitar
            </button>
          </div>
        </div>
        <div *ngIf="(pendingReqs$ | async)?.length === 0" class="p-4 text-sm text-center text-gray-500">
          Nenhuma requisição pendente.
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  private reqService = inject(RequisitionService);
  
  pendingReqs$ = this.reqService.requisitions$.pipe(
    map(reqs => reqs.filter(r => r.status === RequisitionStatus.PENDENTE_ADMIN))
  );

  approve(id: string, total: number) {
    // Encaminha sempre para o PCA após a validação da Administração
    this.reqService.updateStatus(id, RequisitionStatus.PENDENTE_PCA);
  }

  reject(id: string) {
    const reason = prompt('Informe o motivo da rejeição:');
    if (reason) {
      this.reqService.updateStatus(id, RequisitionStatus.REJEITADO, reason);
    }
  }
}
