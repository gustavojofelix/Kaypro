import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';
import { RequisitionService } from '../../../core/services/requisition.service';
import { AuthService } from '../../../core/services/auth.service';
import { Requisition, Role } from '../../../core/models';
import { RequisitionDetailModalComponent } from '../requisition-detail-modal/requisition-detail-modal.component';

@Component({
  selector: 'app-requisitions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RequisitionDetailModalComponent],
  template: `
    <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
        {{ isAdmin ? 'Gestão de Minhas Requisições' : 'Minhas Requisições' }}
      </h2>
      <a routerLink="/requisitions/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors text-center sm:w-auto w-full">
        Nova Requisição
      </a>
    </div>

    <div class="bg-white shadow overflow-hidden rounded-lg">
      <!-- Desktop Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 hidden sm:table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let req of myRequisitions$ | async">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{req.id}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.type}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.date | date:'dd/MM/yyyy HH:mm'}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{req.totalValue | currency:'MZN':'symbol-narrow'}}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': req.status === 'Pendente_Admin' || req.status === 'Pendente_PCA',
                        'bg-green-100 text-green-800': req.status === 'Aprovado',
                        'bg-red-100 text-red-800': req.status === 'Rejeitado',
                        'bg-gray-100 text-gray-800': req.status === 'Rascunho'
                      }">
                  {{req.status}}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="viewDetails(req)" class="text-blue-600 hover:text-blue-900 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                  Ver Detalhes
                </button>
              </td>
            </tr>
            <tr *ngIf="(myRequisitions$ | async)?.length === 0">
              <td colspan="6" class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Nenhuma requisição encontrada.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="sm:hidden divide-y divide-gray-200">
        <div *ngFor="let req of myRequisitions$ | async" class="p-4 space-y-2">
          <div class="flex justify-between items-start">
            <span class="text-sm font-medium text-gray-900">{{req.id}}</span>
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': req.status === 'Pendente_Admin' || req.status === 'Pendente_PCA',
                    'bg-green-100 text-green-800': req.status === 'Aprovado',
                    'bg-red-100 text-red-800': req.status === 'Rejeitado',
                    'bg-gray-100 text-gray-800': req.status === 'Rascunho'
                  }">
              {{req.status}}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{req.type}}</span>
            <span class="font-medium text-gray-900">{{req.totalValue | currency:'MZN':'symbol-narrow'}}</span>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-xs text-gray-400">{{req.date | date:'dd/MM/yyyy HH:mm'}}</div>
            <button (click)="viewDetails(req)" class="text-blue-600 hover:text-blue-900 text-xs font-bold uppercase tracking-tighter px-2 py-1 border border-blue-200 rounded">
              Detalhes
            </button>
          </div>
        </div>
        <div *ngIf="(myRequisitions$ | async)?.length === 0" class="p-4 text-sm text-center text-gray-500">
          Nenhuma requisição encontrada.
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <app-requisition-detail-modal 
      *ngIf="selectedRequisition()" 
      [requisition]="selectedRequisition()!"
      (close)="selectedRequisition.set(null)">
    </app-requisition-detail-modal>
  `
})
export class RequisitionsListComponent implements OnInit {
  private reqService = inject(RequisitionService);
  private authService = inject(AuthService);

  async ngOnInit() {
    await this.reqService.loadRequisitions();
  }
  
  get isAdmin(): boolean {
    return this.authService.hasRole(Role.ADMINISTRACAO);
  }

  myRequisitions$ = this.reqService.requisitions$.pipe(
    map(reqs => reqs.filter(r => r.requesterId === this.authService.currentUserValue?.id))
  );

  selectedRequisition = signal<Requisition | null>(null);

  viewDetails(req: Requisition) {
    this.selectedRequisition.set(req);
  }
}
