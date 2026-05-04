import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { RequisitionService } from '../../../core/services/requisition.service';
import { RequisitionStatus } from '../../../core/models';

@Component({
  selector: 'app-pca-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Despacho PCA (Nível 2)</h2>
    </div>

    <div class="bg-white shadow overflow-hidden sm:rounded-lg border-l-4 border-indigo-500">
      <div class="px-4 py-5 sm:px-6 bg-indigo-50">
        <h3 class="text-lg leading-6 font-medium text-indigo-800">Todas as Requisições em Despacho</h3>
        <p class="mt-1 max-w-2xl text-sm text-indigo-600">Requerem autorização financeira final do PCA.</p>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr *ngFor="let req of pendingReqs$ | async">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{req.id}}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.requesterName}}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.type}}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold text-gray-900">{{req.totalValue | currency:'MZN':'symbol-narrow'}}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button (click)="approve(req.id)" class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md mr-2 transition-colors shadow-sm">
                Aprovação Final
              </button>
              <button (click)="reject(req.id)" class="text-white bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-md transition-colors shadow-sm">
                Rejeitar
              </button>
            </td>
          </tr>
          <tr *ngIf="(pendingReqs$ | async)?.length === 0">
            <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Nenhuma requisição a aguardar despacho.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class PcaDashboardComponent {
  private reqService = inject(RequisitionService);
  
  pendingReqs$ = this.reqService.requisitions$.pipe(
    map(reqs => reqs.filter(r => r.status === RequisitionStatus.PENDENTE_PCA))
  );

  approve(id: string) {
    this.reqService.updateStatus(id, RequisitionStatus.APROVADO);
  }

  reject(id: string) {
    const reason = prompt('Informe o motivo da rejeição:');
    if (reason) {
      this.reqService.updateStatus(id, RequisitionStatus.REJEITADO, reason);
    }
  }
}
