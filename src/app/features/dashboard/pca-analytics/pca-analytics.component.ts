import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequisitionService } from '../../../core/services/requisition.service';

@Component({
  selector: 'app-pca-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900">Visão Global de Negócio</h2>
      <p class="text-gray-500 mt-1">Indicadores e Métricas de Logística e Orçamento</p>
    </div>

    <!-- KPIs Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- KPI 1 -->
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform transition-transform hover:scale-105">
        <div class="text-green-100 text-sm font-medium uppercase tracking-wider mb-2">Total Aprovado (Mês)</div>
        <div class="text-3xl font-bold">
          {{ approvedTotal$ | async | currency:'MZN':'symbol-narrow' }}
        </div>
        <div class="mt-2 text-green-100 text-sm font-light">Valor executado e fechado.</div>
      </div>
      
      <!-- KPI 2 -->
      <div class="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg p-6 text-white transform transition-transform hover:scale-105">
        <div class="text-orange-100 text-sm font-medium uppercase tracking-wider mb-2">Exposição Pendente</div>
        <div class="text-3xl font-bold">
          {{ pendingTotal$ | async | currency:'MZN':'symbol-narrow' }}
        </div>
        <div class="mt-2 text-orange-100 text-sm font-light">Aguardando aprovação no workflow.</div>
      </div>

      <!-- KPI 3 -->
      <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform transition-transform hover:scale-105">
        <div class="text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">Litros Consumidos</div>
        <div class="text-3xl font-bold">
          {{ totalLiters$ | async }} <span class="text-xl font-medium">L</span>
        </div>
        <div class="mt-2 text-blue-100 text-sm font-light">Combustível aprovado/pendente.</div>
      </div>
    </div>

    <!-- Analytics Sections Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Gastos por Obra -->
      <div class="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          Alocação de Custos por Obra
        </h3>
        
        <div class="space-y-5">
          <div *ngFor="let item of spendsByWork$ | async as spends">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">{{item.work}}</span>
              <span class="text-sm font-semibold text-gray-900">{{item.total | currency:'MZN':'symbol-narrow'}}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2.5 shadow-inner">
              <div class="bg-indigo-500 h-2.5 rounded-full" [style.width.%]="(item.total / 100000) * 100 > 100 ? 100 : (item.total / 100000) * 100"></div>
            </div>
          </div>
          <div *ngIf="(spendsByWork$ | async)?.length === 0" class="text-center text-gray-500 text-sm py-4">
            Sem dados de obras.
          </div>
        </div>
      </div>

      <!-- Consumo por Viatura -->
      <div class="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          Top Consumo de Frota
        </h3>
        
        <div class="space-y-4">
          <div *ngFor="let item of fuelByVehicle$ | async; let i = index" class="flex items-center p-3 rounded-lg border border-transparent hover:border-gray-200 transition-colors" [ngClass]="i === 0 ? 'bg-red-50' : 'bg-gray-50'">
            <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" [ngClass]="i === 0 ? 'bg-red-500' : 'bg-gray-400'">
              #{{i + 1}}
            </div>
            <div class="ml-4 flex-1">
              <div class="text-sm font-bold text-gray-900">{{item.plate}}</div>
              <div class="text-xs text-gray-500">Registo de viatura</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold" [ngClass]="i === 0 ? 'text-red-600' : 'text-gray-700'">{{item.liters}} <span class="text-sm font-normal">L</span></div>
            </div>
          </div>
          <div *ngIf="(fuelByVehicle$ | async)?.length === 0" class="text-center text-gray-500 text-sm py-4">
            Sem dados de frota.
          </div>
        </div>
      </div>

    </div>
  `
})
export class PcaAnalyticsComponent {
  private reqService = inject(RequisitionService);

  approvedTotal$ = this.reqService.getApprovedTotal();
  pendingTotal$ = this.reqService.getPendingTotal();
  totalLiters$ = this.reqService.getTotalLiters();
  spendsByWork$ = this.reqService.getSpendsByWork();
  fuelByVehicle$ = this.reqService.getFuelConsumptionByVehicle();
}
