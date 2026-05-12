import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Requisition, RequisitionType } from '../../../core/models';

@Component({
  selector: 'app-requisition-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col transform transition-all duration-300 scale-100">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Detalhes da Requisição: {{ requisition.id }}</h3>
            <p class="text-xs text-gray-500 uppercase tracking-wider">{{ requisition.type }}</p>
          </div>
          <button (click)="close.emit()" class="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          
          <!-- Basic Info Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded-lg">
              <span class="text-xs text-gray-500 block mb-1">Solicitante</span>
              <span class="font-medium text-gray-900">{{ requisition.requesterName }}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <span class="text-xs text-gray-500 block mb-1">Data de Emissão</span>
              <span class="font-medium text-gray-900">{{ requisition.date | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <span class="text-xs text-gray-500 block mb-1">Valor Total</span>
              <span class="font-bold text-blue-600 text-lg">{{ requisition.totalValue | currency:'MZN':'symbol-narrow' }}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <span class="text-xs text-gray-500 block mb-1">Estado Atual</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                [ngClass]="{
                  'bg-yellow-100 text-yellow-800': requisition.status === 'Pendente_Admin' || requisition.status === 'Pendente_PCA',
                  'bg-green-100 text-green-800': requisition.status === 'Aprovado',
                  'bg-red-100 text-red-800': requisition.status === 'Rejeitado',
                  'bg-gray-100 text-gray-800': requisition.status === 'Rascunho'
                }">
                {{ requisition.status }}
              </span>
            </div>
          </div>

          <!-- Rejection Reason if any -->
          <div *ngIf="requisition.status === 'Rejeitado'" class="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <h4 class="text-sm font-bold text-red-800 mb-1">Motivo da Rejeição:</h4>
            <p class="text-sm text-red-700 italic">"{{ requisition.rejectionReason }}"</p>
          </div>

          <!-- Specific Content: MATERIAL -->
          <div *ngIf="requisition.type === reqType.MATERIAL" class="space-y-4">
            <div class="flex items-center gap-2 text-gray-800 font-bold border-b pb-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              Itens da Requisição (Obra: {{ requisition.destinationWork }})
            </div>
            <div class="overflow-hidden border rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                  <tr>
                    <th class="px-4 py-2 text-left">Material</th>
                    <th class="px-4 py-2 text-center">Unid.</th>
                    <th class="px-4 py-2 text-center">Qtd.</th>
                    <th class="px-4 py-2 text-right">Preço Un.</th>
                    <th class="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-sm">
                  <tr *ngFor="let item of requisition.items" class="hover:bg-gray-50">
                    <td class="px-4 py-2 font-medium text-gray-900">{{ item.material }}</td>
                    <td class="px-4 py-2 text-center text-gray-600">{{ item.unit }}</td>
                    <td class="px-4 py-2 text-center text-gray-900">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-right text-gray-600">{{ item.unitCost | currency:'MZN':'' }}</td>
                    <td class="px-4 py-2 text-right font-semibold text-gray-900">{{ item.total | currency:'MZN':'' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Specific Content: COMBUSTIVEL -->
          <div *ngIf="requisition.type === reqType.COMBUSTIVEL" class="space-y-4">
            <div class="flex items-center gap-2 text-gray-800 font-bold border-b pb-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Detalhes do Abastecimento
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="border rounded-lg p-4 text-center bg-blue-50/30">
                <p class="text-xs text-gray-500 uppercase mb-1">Marca da Viatura</p>
                <p class="text-lg font-bold text-gray-900">{{ requisition.vehicleId }}</p>
              </div>
              <div class="border rounded-lg p-4 text-center bg-blue-50/30">
                <p class="text-xs text-gray-500 uppercase mb-1">Quilometragem</p>
                <p class="text-lg font-bold text-gray-900">{{ requisition.currentKm }} <span class="text-xs">Km</span></p>
              </div>
              <div class="border rounded-lg p-4 text-center bg-blue-50/30">
                <p class="text-xs text-gray-500 uppercase mb-1">Quantidade</p>
                <p class="text-lg font-bold text-gray-900 text-blue-600">{{ requisition.liters }} <span class="text-xs text-blue-500">L</span></p>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer / Actions -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button (click)="close.emit()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm">
            Fechar
          </button>
        </div>
      </div>
    </div>
  `
})
export class RequisitionDetailModalComponent {
  @Input({ required: true }) requisition!: Requisition;
  @Output() close = new EventEmitter<void>();

  reqType = RequisitionType;
}
