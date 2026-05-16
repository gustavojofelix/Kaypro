import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { RequisitionService } from '../../../core/services/requisition.service';
import { RequisitionStatus, Requisition } from '../../../core/models';
import { RequisitionDetailModalComponent } from '../../requisitions/requisition-detail-modal/requisition-detail-modal.component';

@Component({
  selector: 'app-pca-dashboard',
  standalone: true,
  imports: [CommonModule, RequisitionDetailModalComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50/30 p-4 sm:p-8">
      <!-- Header Section -->
      <header class="mb-10">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h1 class="text-3xl font-black text-gray-900 tracking-tight">Centro de Controlo PCA</h1>
            </div>
            <p class="text-gray-500 font-medium ml-1">Monitorização estratégica e despacho financeiro de alto nível.</p>
          </div>
          
          <!-- Navigation Tabs -->
          <nav class="flex p-1.5 bg-gray-200/50 backdrop-blur-md rounded-2xl w-full lg:w-auto shadow-inner border border-gray-100">
            <button (click)="activeTab.set('pending')"
                    [class.tab-active]="activeTab() === 'pending'"
                    class="flex-1 lg:px-8 py-3 text-sm font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
              <span class="w-2 h-2 rounded-full" [class.bg-blue-500]="activeTab() === 'pending'" [class.bg-gray-400]="activeTab() !== 'pending'"></span>
              Pendentes
              <span class="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-[10px]" *ngIf="(pendingReqs$ | async)?.length">
                {{ (pendingReqs$ | async)?.length }}
              </span>
            </button>
            <button (click)="activeTab.set('history')"
                    [class.tab-active]="activeTab() === 'history'"
                    class="flex-1 lg:px-8 py-3 text-sm font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Histórico Global
            </button>
          </nav>
        </div>
      </header>

      <!-- Dashboard Insights (Summary Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <!-- Approved KPI -->
        <div class="kpi-card group">
          <div class="flex justify-between items-start mb-4">
            <div class="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span class="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+12% este mês</span>
          </div>
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Aprovado Final</p>
          <p class="text-3xl font-black text-gray-900 tracking-tight">{{ stats().totalApproved | currency:'MZN':'symbol-narrow' }}</p>
        </div>

        <!-- Processing KPI -->
        <div class="kpi-card group border-l-4 border-l-amber-500">
          <div class="flex justify-between items-start mb-4">
            <div class="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
          </div>
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Requisições em Fluxo</p>
          <p class="text-3xl font-black text-gray-900 tracking-tight">{{ stats().pendingCount }} <span class="text-sm font-medium text-gray-400">activos</span></p>
        </div>

        <!-- Rejected KPI -->
        <div class="kpi-card group border-l-4 border-l-rose-500">
          <div class="flex justify-between items-start mb-4">
            <div class="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Volume Rejeitado</p>
          <p class="text-3xl font-black text-gray-900 tracking-tight">{{ stats().rejectedCount }} <span class="text-sm font-medium text-gray-400">pedidos</span></p>
        </div>
      </div>

      <!-- Main Content Area -->
      <main class="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        <!-- Filters Bar (Only for History) -->
        <div *ngIf="activeTab() === 'history'" class="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          <div class="relative flex-1 w-full">
            <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Localizar requisição por ID ou solicitante..."
                   class="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm">
          </div>
          <select [(ngModel)]="statusFilter" class="w-full md:w-64 px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 shadow-sm">
            <option value="ALL">Todos os Estados</option>
            <option [value]="RequisitionStatus.APROVADO">Aprovados</option>
            <option [value]="RequisitionStatus.REJEITADO">Rejeitados</option>
            <option [value]="RequisitionStatus.PENDENTE_PCA">Aguardando Despacho</option>
            <option [value]="RequisitionStatus.PENDENTE_ADMIN">Em Validação Admin</option>
          </select>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto">
          <!-- Pending View -->
          <div *ngIf="activeTab() === 'pending'" class="p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h3 class="text-xl font-black text-gray-900">Requisições a aguardar Despacho</h3>
            </div>
            
            <table class="min-w-full divide-y divide-gray-100 hidden md:table">
              <thead>
                <tr>
                  <th class="table-header">Referência / Data</th>
                  <th class="table-header">Solicitante</th>
                  <th class="table-header">Categoria</th>
                  <th class="table-header text-right">Montante</th>
                  <th class="table-header text-right">Acções Estratégicas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngFor="let req of pendingReqs$ | async" class="table-row">
                  <td class="px-6 py-5">
                    <div class="text-sm font-black text-gray-900 tracking-tight">#{{req.id.substring(0, 8)}}</div>
                    <div class="text-[11px] text-gray-400 font-bold uppercase mt-1">{{req.date | date:'dd MMM yyyy • HH:mm'}}</div>
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-100">
                        {{req.requesterName.substring(0, 2).toUpperCase()}}
                      </div>
                      <span class="text-sm font-bold text-gray-700">{{req.requesterName}}</span>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <span class="badge badge-gray">{{req.type}}</span>
                  </td>
                  <td class="px-6 py-5 text-right">
                    <div class="text-sm font-black text-gray-900 tracking-tight">{{req.totalValue | currency:'MZN':'symbol-narrow'}}</div>
                  </td>
                  <td class="px-6 py-5 text-right space-x-2">
                    <button (click)="viewDetails(req)" class="icon-btn" title="Analisar Detalhes">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button (click)="approve(req.id)" class="btn-action btn-success">Aprovar</button>
                    <button (click)="reject(req.id)" class="btn-action btn-danger">Rejeitar</button>
                  </td>
                </tr>
                <!-- Empty State -->
                <tr *ngIf="(pendingReqs$ | async)?.length === 0">
                  <td colspan="5" class="py-24 text-center">
                    <div class="flex flex-col items-center">
                      <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <h4 class="text-lg font-black text-gray-900">Workflow Limpo</h4>
                      <p class="text-sm text-gray-500">Não há requisições pendentes de autorização final.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- History View -->
          <div *ngIf="activeTab() === 'history'" class="p-8">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-2 h-8 bg-gray-400 rounded-full"></div>
                <h3 class="text-xl font-black text-gray-900">Rastreabilidade Global</h3>
              </div>
              <button (click)="ngOnInit()" class="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                ACTUALIZAR
              </button>
            </div>

            <table class="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th class="table-header">Ref. / Data</th>
                  <th class="table-header">Solicitante</th>
                  <th class="table-header">Status Actual</th>
                  <th class="table-header text-right">Valor</th>
                  <th class="table-header text-right">Ficha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngFor="let req of filteredHistory$ | async" class="table-row">
                  <td class="px-6 py-5">
                    <div class="text-sm font-black text-gray-900 tracking-tight">#{{req.id.substring(0, 8)}}</div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase mt-1">{{req.date | date:'dd/MM/yyyy HH:mm'}}</div>
                  </td>
                  <td class="px-6 py-5">
                    <span class="text-sm font-bold text-gray-700">{{req.requesterName}}</span>
                  </td>
                  <td class="px-6 py-5">
                    <span class="badge"
                          [ngClass]="{
                            'badge-success': req.status === RequisitionStatus.APROVADO,
                            'badge-danger': req.status === RequisitionStatus.REJEITADO,
                            'badge-warning': req.status === RequisitionStatus.PENDENTE_PCA,
                            'badge-info': req.status === RequisitionStatus.PENDENTE_ADMIN
                          }">
                      {{req.status}}
                    </span>
                  </td>
                  <td class="px-6 py-5 text-right font-black text-gray-900 text-sm">
                    {{req.totalValue | currency:'MZN':'symbol-narrow'}}
                  </td>
                  <td class="px-6 py-5 text-right">
                    <button (click)="viewDetails(req)" class="icon-btn hover:text-blue-600">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="(filteredHistory$ | async)?.length === 0">
                  <td colspan="5" class="py-20 text-center text-gray-400 text-sm font-medium italic">
                    Nenhum registo encontrado com os critérios de pesquisa.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Detail Modal -->
    <app-requisition-detail-modal 
      *ngIf="selectedRequisition()" 
      [requisition]="selectedRequisition()!"
      (close)="selectedRequisition.set(null)">
    </app-requisition-detail-modal>
  `,
  styles: [`
    .tab-active { @apply bg-white text-blue-600 shadow-xl shadow-blue-500/10 border border-white; }
    .kpi-card { @apply bg-white p-7 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-200/40 hover:shadow-xl transition-all duration-300; }
    .table-header { @apply px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]; }
    .table-row { @apply hover:bg-gray-50/80 transition-all duration-200 cursor-default; }
    .badge { @apply px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider inline-flex items-center; }
    .badge-gray { @apply bg-gray-100 text-gray-600; }
    .badge-success { @apply bg-emerald-50 text-emerald-700 border border-emerald-100; }
    .badge-danger { @apply bg-rose-50 text-rose-700 border border-rose-100; }
    .badge-warning { @apply bg-amber-50 text-amber-700 border border-amber-100; }
    .badge-info { @apply bg-blue-50 text-blue-700 border border-blue-100; }
    .icon-btn { @apply p-2.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100; }
    .btn-action { @apply px-5 py-2.5 text-xs font-black rounded-xl transition-all duration-300 active:scale-95 shadow-md; }
    .btn-success { @apply bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200; }
    .btn-danger { @apply bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200; }
  `]
})
export class PcaDashboardComponent implements OnInit {
  private reqService = inject(RequisitionService);
  
  RequisitionStatus = RequisitionStatus;
  activeTab = signal<'pending' | 'history'>('pending');
  searchTerm = '';
  statusFilter = 'ALL';
  selectedRequisition = signal<Requisition | null>(null);

  async ngOnInit() {
    await this.reqService.loadRequisitions();
  }

  pendingReqs$ = this.reqService.requisitions$.pipe(
    map(reqs => reqs.filter(r => r.status === RequisitionStatus.PENDENTE_PCA))
  );

  filteredHistory$ = this.reqService.requisitions$.pipe(
    map(reqs => {
      let filtered = [...reqs];
      if (this.statusFilter !== 'ALL') {
        filtered = filtered.filter(r => r.status === this.statusFilter);
      }
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(r => 
          r.id.toLowerCase().includes(term) || 
          r.requesterName?.toLowerCase().includes(term)
        );
      }
      return filtered;
    })
  );

  stats = computed(() => {
    const all = this.reqService.getRequisitions();
    return {
      totalApproved: all.filter(r => r.status === RequisitionStatus.APROVADO).reduce((acc, curr) => acc + (curr.totalValue || 0), 0),
      pendingCount: all.filter(r => r.status === RequisitionStatus.PENDENTE_PCA || r.status === RequisitionStatus.PENDENTE_ADMIN).length,
      rejectedCount: all.filter(r => r.status === RequisitionStatus.REJEITADO).length
    };
  });

  viewDetails(req: Requisition) {
    this.selectedRequisition.set(req);
  }

  async approve(id: string) {
    if (confirm('Tem certeza que deseja aprovar esta requisição?')) {
      await this.reqService.updateStatus(id, RequisitionStatus.APROVADO);
    }
  }

  async reject(id: string) {
    const reason = prompt('Informe o motivo da rejeição:');
    if (reason) {
      await this.reqService.updateStatus(id, RequisitionStatus.REJEITADO, reason);
    }
  }
}
