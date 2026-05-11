import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Factura, FacturaEstado } from '../../core/models';
import { FacturaService } from '../../core/services/factura.service';

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
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de Criação</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr *ngFor="let factura of facturas(); let i = index"
                class="hover:bg-gray-50 transition-colors"
                [class.bg-gray-50/50]="i % 2 !== 0">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ factura.numero }}</td>
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
            </tr>
            <tr *ngIf="facturas().length === 0">
              <td colspan="4" class="px-6 py-16 text-center">
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

    <!-- Modal Backdrop -->
    <div *ngIf="showModal()"
         class="fixed inset-0 z-50 flex items-center justify-center p-4"
         (click)="closeModal()">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all"
           (click)="$event.stopPropagation()">

        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">Lançar Nova Factura</h3>
          <button (click)="closeModal()"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 space-y-5">
          <!-- Nº de Factura -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nº de Factura <span class="text-red-500">*</span></label>
            <input type="text"
                   [(ngModel)]="formNumero"
                   placeholder="Ex: FT-2026/001"
                   class="w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                   [class.border-red-300]="submitted() && !formNumero"
                   [class.border-gray-300]="!(submitted() && !formNumero)" />
            <p *ngIf="submitted() && !formNumero" class="mt-1 text-xs text-red-500">Campo obrigatório.</p>
          </div>

          <!-- Valor -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Valor (MZN) <span class="text-red-500">*</span></label>
            <input type="number"
                   [(ngModel)]="formValor"
                   placeholder="0.00"
                   min="0"
                   step="0.01"
                   class="w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                   [class.border-red-300]="submitted() && (!formValor || formValor <= 0)"
                   [class.border-gray-300]="!(submitted() && (!formValor || formValor <= 0))" />
            <p *ngIf="submitted() && (!formValor || formValor <= 0)" class="mt-1 text-xs text-red-500">Informe um valor válido.</p>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Estado da Factura</label>
            <select [(ngModel)]="formEstado"
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none">
              <option [value]="estados.PENDENTE">Pendente</option>
              <option [value]="estados.PAGA">Paga</option>
              <option [value]="estados.CANCELADA">Cancelada</option>
            </select>
          </div>

          <!-- Calculated Totals -->
          <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div class="bg-emerald-50 rounded-lg p-3.5">
              <div class="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Total Pagas</div>
              <div class="text-lg font-bold text-emerald-700">{{ totalPagas() | currency:'MZN':'symbol-narrow' }}</div>
            </div>
            <div class="bg-rose-50 rounded-lg p-3.5">
              <div class="text-xs font-medium text-rose-600 uppercase tracking-wider mb-1">Total Dívidas</div>
              <div class="text-lg font-bold text-rose-700">{{ totalDividas() | currency:'MZN':'symbol-narrow' }}</div>
            </div>
          </div>

          <!-- Save Error -->
          <div *ngIf="saveError()" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm text-red-600">{{ saveError() }}</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button (click)="closeModal()"
                  class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300">
            Cancelar
          </button>
          <button (click)="salvarFactura()"
                  [disabled]="isSaving()"
                  class="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center">
            <svg *ngIf="isSaving()" class="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSaving() ? 'A salvar...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class FacturacaoComponent implements OnInit {
  private facturaService = inject(FacturaService);

  estados = FacturaEstado;

  facturas = signal<Factura[]>([]);
  showModal = signal(false);
  submitted = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  saveError = signal('');

  formNumero = '';
  formValor: number | null = null;
  formEstado: FacturaEstado = FacturaEstado.PENDENTE;

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
    await this.facturaService.loadFacturas();
    this.facturaService.facturas$.subscribe(facturas => {
      this.facturas.set(facturas);
    });
    this.isLoading.set(false);
  }

  openModal(): void {
    this.submitted.set(false);
    this.saveError.set('');
    this.formNumero = '';
    this.formValor = null;
    this.formEstado = FacturaEstado.PENDENTE;
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

    if (!this.formNumero || !this.formValor || this.formValor <= 0) {
      return;
    }

    this.isSaving.set(true);

    const { error } = await this.facturaService.addFactura({
      numero: this.formNumero,
      valor: this.formValor,
      estado: this.formEstado
    });

    this.isSaving.set(false);

    if (error) {
      this.saveError.set('Erro ao salvar a factura. Tente novamente.');
      return;
    }

    this.closeModal();
  }
}
