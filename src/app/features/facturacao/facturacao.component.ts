import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Factura, FacturaEstado, Cliente } from '../../core/models';
import { FacturaService } from '../../core/services/factura.service';
import { ClienteService } from '../../core/services/cliente.service';

@Component({
  selector: 'app-facturacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <div class="mb-6 sm:mb-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Facturação</h2>
      <p class="text-gray-500 mt-1 text-sm sm:text-base">Gestão de facturas e controlo financeiro</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform transition-transform hover:scale-105">
        <div class="text-emerald-100 text-xs sm:text-sm font-medium uppercase tracking-wider mb-2">Total Pagas</div>
        <div class="text-2xl sm:text-3xl font-bold">{{ totalPagas() | currency:'MZN':'symbol-narrow' }}</div>
        <div class="mt-2 text-emerald-100 text-xs sm:text-sm font-light">Facturas liquidadas.</div>
      </div>
      <div class="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg p-4 sm:p-6 text-white transform transition-transform hover:scale-105">
        <div class="text-amber-100 text-xs sm:text-sm font-medium uppercase tracking-wider mb-2">Total Pendentes</div>
        <div class="text-2xl sm:text-3xl font-bold">{{ totalPendentes() | currency:'MZN':'symbol-narrow' }}</div>
        <div class="mt-2 text-amber-100 text-xs sm:text-sm font-light">Aguardando pagamento.</div>
      </div>
      <div class="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform transition-transform hover:scale-105">
        <div class="text-rose-100 text-xs sm:text-sm font-medium uppercase tracking-wider mb-2">Total das Dívidas</div>
        <div class="text-2xl sm:text-3xl font-bold">{{ totalDividas() | currency:'MZN':'symbol-narrow' }}</div>
        <div class="mt-2 text-rose-100 text-xs sm:text-sm font-light">Pendentes + Canceladas por cobrar.</div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="flex justify-end mb-6">
      <button
        (click)="openModal()"
        class="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
        <svg class="w-5 h-5 mr-2 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Lançar Nova Factura
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="isLoading()" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Table -->
    <div *ngIf="!isLoading()" class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nº da Factura</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de Criação</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acções</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr *ngFor="let factura of facturas(); let i = index"
                class="hover:bg-gray-50 transition-colors"
                [class.bg-gray-50/50]="i % 2 !== 0">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ factura.numero }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span class="font-semibold">{{ factura.clientName || 'N/A' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ factura.valor | currency:'MZN':'symbol-narrow' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': factura.estado === 'Pendente',
                        'bg-green-100 text-green-800': factura.estado === 'Paga',
                        'bg-red-100 text-red-800': factura.estado === 'Cancelada'
                      }">
                  {{ factura.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ factura.dataCriacao | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="viewDetails(factura)" 
                        class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Ver Detalhes">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="facturas().length === 0">
              <td colspan="6" class="px-6 py-16 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-500 text-sm font-medium">Nenhuma factura registada.</p>
                <p class="text-gray-400 text-xs mt-1">Clique em "Lançar Nova Factura" para começar.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <div *ngIf="selectedFactura()"
         class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
         (click)="closeDetails()">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300"
           (click)="$event.stopPropagation()">
        
        <!-- Header with Gradient -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Detalhes da Factura</h3>
              <p class="text-blue-100 text-xs">{{ selectedFactura()?.numero }}</p>
            </div>
          </div>
          <button (click)="closeDetails()"
                  class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="px-6 py-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <!-- Quick Summary Section -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
              <div class="p-3 bg-blue-100 rounded-xl text-blue-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <div class="text-xs font-medium text-gray-500 uppercase">Valor Total</div>
                <div class="text-xl font-black text-gray-900">{{ selectedFactura()?.valor | currency:'MZN':'symbol-narrow' }}</div>
              </div>
            </div>
            
            <div class="rounded-2xl p-4 border flex items-center gap-4 shadow-sm"
                 [ngClass]="{
                   'bg-yellow-50 border-yellow-100 text-yellow-800': selectedFactura()?.estado === 'Pendente',
                   'bg-emerald-50 border-emerald-100 text-emerald-800': selectedFactura()?.estado === 'Paga',
                   'bg-rose-50 border-rose-100 text-rose-800': selectedFactura()?.estado === 'Cancelada'
                 }">
              <div class="p-3 rounded-xl transition-colors"
                   [ngClass]="{
                     'bg-yellow-200/50': selectedFactura()?.estado === 'Pendente',
                     'bg-emerald-200/50': selectedFactura()?.estado === 'Paga',
                     'bg-rose-200/50': selectedFactura()?.estado === 'Cancelada'
                   }">
                <svg *ngIf="selectedFactura()?.estado === 'Pendente'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <svg *ngIf="selectedFactura()?.estado === 'Paga'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <svg *ngIf="selectedFactura()?.estado === 'Cancelada'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <div>
                <div class="text-xs font-medium opacity-70 uppercase tracking-wide">Estado</div>
                <div class="text-lg font-bold">{{ selectedFactura()?.estado }}</div>
              </div>
            </div>
          </div>

          <!-- Main Info Sections -->
          <div class="space-y-8">
            <!-- Factura Info -->
            <section>
              <h4 class="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                <span class="w-8 h-[1px] bg-gray-200"></span>
                Informação da Factura
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 px-2">
                <div>
                  <div class="text-xs text-gray-400 mb-1">Data de Lançamento</div>
                  <div class="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {{ selectedFactura()?.dataCriacao | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </div>
                <div>
                  <div class="text-xs text-gray-400 mb-1">Identificador Único (UUID)</div>
                  <div class="text-[10px] font-mono text-gray-400 break-all bg-gray-50 p-1.5 rounded">{{ selectedFactura()?.id }}</div>
                </div>
              </div>
            </section>

            <!-- Client Info Card -->
            <section>
              <h4 class="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                <span class="w-8 h-[1px] bg-gray-200"></span>
                Dados do Cliente
              </h4>
              <div class="bg-blue-50/30 rounded-2xl p-6 border border-blue-100/50 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                  <div class="text-sm text-gray-500">Razão Social / Nome</div>
                  <div class="text-base font-bold text-blue-900">{{ selectedFactura()?.clientName }}</div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div class="text-[10px] text-gray-400 uppercase mb-1">NUIT</div>
                    <div class="text-sm font-semibold text-gray-800">{{ selectedFactura()?.clientNuit || '---' }}</div>
                  </div>
                  <div class="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div class="text-[10px] text-gray-400 uppercase mb-1">Entidade</div>
                    <div class="text-sm font-semibold text-gray-800">{{ selectedFactura()?.clientEntidade || '---' }}</div>
                  </div>
                </div>

                <div class="p-4 bg-white rounded-xl border border-gray-100 shadow-sm" *ngIf="selectedFactura()?.clientEndereco">
                  <div class="text-[10px] text-gray-400 uppercase mb-2">Endereço de Facturação</div>
                  <div class="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                    <svg class="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {{ selectedFactura()?.clientEndereco }}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Footer with Glassmorphism touch -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button (click)="closeDetails()"
                    class="flex-1 sm:flex-none px-8 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-sm">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div *ngIf="showModal()"
         class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
         (click)="closeModal()">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"></div>

      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300"
           (click)="$event.stopPropagation()">

        <!-- Modal Header with Gradient -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Nova Factura</h3>
              <p class="text-blue-100 text-xs">Preencha os dados abaixo</p>
            </div>
          </div>
          <button (click)="closeModal()"
                  class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <!-- Cliente Dropdown -->
          <div class="group">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Seleccionar Cliente <span class="text-red-500">*</span></label>
            <div class="relative">
              <select [(ngModel)]="formClientId"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer group-hover:bg-white"
                      [class.border-red-300]="submitted() && !formClientId"
                      [class.bg-red-50]="submitted() && !formClientId">
                <option value="">Seleccione um cliente...</option>
                <option *ngFor="let cliente of clientes()" [value]="cliente.id">{{ cliente.nome }}</option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <p *ngIf="submitted() && !formClientId" class="mt-2 text-[11px] font-medium text-red-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
              Deve seleccionar um cliente.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Nº de Factura -->
            <div class="group">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nº de Factura <span class="text-red-500">*</span></label>
              <input type="text"
                     [(ngModel)]="formNumero"
                     placeholder="Ex: FT-2026/001"
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all group-hover:bg-white"
                     [class.border-red-300]="submitted() && !formNumero"
                     [class.bg-red-50]="submitted() && !formNumero" />
              <p *ngIf="submitted() && !formNumero" class="mt-2 text-[11px] font-medium text-red-500">Campo obrigatório.</p>
            </div>

            <!-- Valor -->
            <div class="group">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Valor (MZN) <span class="text-red-500">*</span></label>
              <div class="relative">
                <input type="number"
                       [(ngModel)]="formValor"
                       placeholder="0.00"
                       min="0"
                       step="0.01"
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all group-hover:bg-white pl-12"
                       [class.border-red-300]="submitted() && (!formValor || formValor <= 0)"
                       [class.bg-red-50]="submitted() && (!formValor || formValor <= 0)" />
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold border-r border-gray-200 pr-2">MZN</div>
              </div>
              <p *ngIf="submitted() && (!formValor || formValor <= 0)" class="mt-2 text-[11px] font-medium text-red-500">Informe um valor válido.</p>
            </div>
          </div>

          <!-- Estado -->
          <div class="group">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Estado da Factura</label>
            <div class="flex flex-wrap gap-3">
              <button *ngFor="let st of [estados.PENDENTE, estados.PAGA, estados.CANCELADA]"
                      (click)="formEstado = st"
                      type="button"
                      class="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2"
                      [ngClass]="{
                        'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105': formEstado === st,
                        'bg-white border-gray-100 text-gray-500 hover:border-gray-200': formEstado !== st
                      }">
                {{ st }}
              </button>
            </div>
          </div>

          <!-- Save Error -->
          <div *ngIf="saveError()" class="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-pulse">
            <div class="p-2 bg-rose-100 rounded-lg text-rose-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span class="text-sm font-medium text-rose-700">{{ saveError() }}</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-5 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button (click)="closeModal()"
                  class="w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-sm">
            Cancelar
          </button>
          <button (click)="salvarFactura()"
                  [disabled]="isSaving()"
                  class="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center">
            <svg *ngIf="isSaving()" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSaving() ? 'A processar...' : 'Confirmar Lançamento' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class FacturacaoComponent implements OnInit {
  private facturaService = inject(FacturaService);
  private clienteService = inject(ClienteService);

  estados = FacturaEstado;

  facturas = signal<Factura[]>([]);
  clientes = signal<Cliente[]>([]);
  showModal = signal(false);
  selectedFactura = signal<Factura | null>(null);
  submitted = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  saveError = signal('');

  formNumero = '';
  formValor: number | null = null;
  formEstado: FacturaEstado = FacturaEstado.PENDENTE;
  formClientId = '';

  viewDetails(factura: Factura): void {
    this.selectedFactura.set(factura);
  }

  closeDetails(): void {
    this.selectedFactura.set(null);
  }

  totalPagas = computed(() =>
    this.facturas()
      .filter(f => f.estado === FacturaEstado.PAGA)
      .reduce((sum, f) => sum + f.valor, 0)
  );

  totalPendentes = computed(() =>
    this.facturas()
      .filter(f => f.estado === FacturaEstado.PENDENTE)
      .reduce((sum, f) => sum + f.valor, 0)
  );

  totalDividas = computed(() =>
    this.facturas()
      .filter(f => f.estado !== FacturaEstado.PAGA)
      .reduce((sum, f) => sum + f.valor, 0)
  );

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.facturaService.loadFacturas();
      this.clientes.set(await this.clienteService.getClientes());
      this.facturaService.facturas$.subscribe(facturas => {
        this.facturas.set(facturas);
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  openModal(): void {
    this.submitted.set(false);
    this.saveError.set('');
    this.formNumero = '';
    this.formValor = null;
    this.formEstado = FacturaEstado.PENDENTE;
    this.formClientId = '';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.submitted.set(false);
    this.saveError.set('');
  }

  async salvarFactura(): Promise<void> {
    this.submitted.set(true);
    this.saveError.set('');

    if (!this.formNumero || !this.formValor || this.formValor <= 0 || !this.formClientId) {
      return;
    }

    this.isSaving.set(true);

    const { error } = await this.facturaService.addFactura({
      numero: this.formNumero,
      valor: this.formValor,
      estado: this.formEstado,
      clientId: this.formClientId
    });

    this.isSaving.set(true);

    if (error) {
      this.saveError.set('Erro ao salvar a factura. Tente novamente.');
      this.isSaving.set(false);
      return;
    }

    this.isSaving.set(false);
    this.closeModal();
  }
}

