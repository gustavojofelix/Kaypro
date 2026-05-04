import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';
import { RequisitionService } from '../../../core/services/requisition.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-requisitions-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Minhas Requisições</h2>
      <a routerLink="/requisitions/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors">
        Nova Requisição
      </a>
    </div>

    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr *ngFor="let req of myRequisitions$ | async">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{req.id}}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.type}}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.date | date:'dd/MM/yyyy HH:mm'}}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.totalValue | currency:'MZN':'symbol-narrow'}}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': req.status === 'Pendente_Admin' || req.status === 'Pendente_PCA',
                      'bg-green-100 text-green-800': req.status === 'Aprovado',
                      'bg-red-100 text-red-800': req.status === 'Rejeitado',
                      'bg-gray-100 text-gray-800': req.status === 'Rascunho'
                    }">
                {{req.status}}
              </span>
              <div *ngIf="req.status === 'Rejeitado'" class="text-xs text-red-500 mt-1">
                Motivo: {{req.rejectionReason}}
              </div>
            </td>
          </tr>
          <tr *ngIf="(myRequisitions$ | async)?.length === 0">
            <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Nenhuma requisição encontrada.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class RequisitionsListComponent {
  private reqService = inject(RequisitionService);
  private authService = inject(AuthService);
  
  myRequisitions$ = this.reqService.requisitions$.pipe(
    map(reqs => reqs.filter(r => r.requesterId === this.authService.currentUserValue?.id))
  );
}
