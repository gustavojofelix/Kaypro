import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { FacturaService } from '../../core/services/factura.service';
import { Cliente } from '../../core/models';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Gestão de Clientes</h2>
          <p class="mt-2 text-sm text-gray-500">Registo e listagem de entidades clientes no sistema.</p>
        </div>
        <button 
          (click)="openModal()"
          class="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-150">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Adicionar Cliente
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Tabela de Clientes -->
      <div *ngIf="!loading() && clientes().length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entidade</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NUIT</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr *ngFor="let cliente of clientes()" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" (click)="viewDetails(cliente)">
                    {{ cliente.nome }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ cliente.entidade }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{{ cliente.nuit }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button (click)="viewDetails(cliente)" class="text-gray-600 hover:text-gray-900 bg-gray-100 p-1.5 rounded-md transition-colors" title="Ver Detalhes">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </button>
                  <button (click)="editCliente(cliente)" class="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors" title="Editar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button (click)="deleteCliente(cliente)" class="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors" title="Eliminar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && clientes().length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
        <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum cliente registado</h3>
        <p class="text-gray-500 mb-8 max-w-sm mx-auto">Registe os seus clientes para poder emitir facturas e gerir as suas contas.</p>
        <button (click)="openModal()" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          Registar primeiro cliente
        </button>
      </div>
    </div>

    <!-- Modal Form -->
    <div *ngIf="isModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing() ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome do Cliente <span class="text-red-500">*</span></label>
            <input type="text" name="nome" [(ngModel)]="form.nome" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome da Entidade <span class="text-red-500">*</span></label>
            <input type="text" name="entidade" [(ngModel)]="form.entidade" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">NUIT <span class="text-red-500">*</span></label>
            <input type="text" name="nuit" [(ngModel)]="form.nuit" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Endereço <span class="text-red-500">*</span></label>
            <textarea name="endereco" [(ngModel)]="form.endereco" rows="3" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"></textarea>
          </div>

          <div *ngIf="error()" class="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            {{ error() }}
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" (click)="closeModal()"
              class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="submitting()"
              class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50">
              {{ submitting() ? 'Salvando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div *ngIf="selectedCliente()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700">
          <div>
            <h3 class="text-xl font-bold text-white">Ficha do Cliente</h3>
            <p class="text-blue-100 text-xs">{{ selectedCliente()?.entidade }}</p>
          </div>
          <button (click)="closeDetails()" class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          <!-- Main Info -->
          <div class="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
            <div class="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 text-2xl font-black shadow-inner">
              {{ selectedCliente()?.nome?.substring(0, 2)?.toUpperCase() }}
            </div>
            <div class="text-center sm:text-left">
              <h4 class="text-2xl font-black text-gray-900 leading-tight">{{ selectedCliente()?.nome }}</h4>
              <p class="text-sm text-gray-500 font-medium mt-1">NIF: <span class="text-gray-900 font-mono">{{ selectedCliente()?.nuit }}</span> • Desde {{ selectedCliente()?.dataCriacao | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>

          <!-- Extra Info Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entidade Fiscal</p>
              <p class="text-sm font-bold text-gray-800">{{ selectedCliente()?.entidade }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Endereço Registado</p>
              <p class="text-sm font-bold text-gray-800 leading-relaxed">{{ selectedCliente()?.endereco }}</p>
            </div>
          </div>

          <!-- Facturas Section -->
          <section class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Histórico de Facturação</h4>
              <span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase">
                {{ clientFacturas().length }} Documentos
              </span>
            </div>

            <!-- Loading Facturas -->
            <div *ngIf="loadingFacturas()" class="flex flex-col items-center py-10 space-y-3">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p class="text-xs text-gray-400 font-medium">A carregar extracto...</p>
            </div>

            <!-- Facturas List -->
            <div *ngIf="!loadingFacturas() && clientFacturas().length > 0" class="space-y-3">
              <div *ngFor="let fact of clientFacturas()" 
                   class="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all cursor-default">
                <div class="flex items-center gap-4">
                  <div class="p-2.5 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900">{{ fact.numero }}</div>
                    <div class="text-[10px] text-gray-400 font-medium">{{ fact.dataCriacao | date:'dd/MM/yyyy HH:mm' }}</div>
                  </div>
                </div>
                
                <div class="text-right flex flex-col items-end gap-1.5">
                  <div class="text-sm font-black text-gray-900">{{ fact.valor | currency:'MZN':'symbol-narrow' }}</div>
                  <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-700': fact.estado === 'Pendente',
                          'bg-emerald-100 text-emerald-700': fact.estado === 'Paga',
                          'bg-rose-100 text-rose-700': fact.estado === 'Cancelada'
                        }">
                    {{ fact.estado }}
                  </span>
                </div>
              </div>
            </div>

            <!-- No Facturas -->
            <div *ngIf="!loadingFacturas() && clientFacturas().length === 0" class="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
              <svg class="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm font-bold text-gray-400">Sem histórico financeiro</p>
              <p class="text-[10px] text-gray-300 mt-1">Este cliente ainda não possui facturas emitidas.</p>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button (click)="closeDetails()" class="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-sm">
            Fechar
          </button>
        </div>
      </div>
    </div>
  `
})
export class ClientesListComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private facturaService = inject(FacturaService);

  clientes = signal<Cliente[]>([]);
  clientFacturas = signal<any[]>([]);
  loading = signal(true);
  loadingFacturas = signal(false);
  isModalOpen = signal(false);
  isEditing = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  selectedCliente = signal<Cliente | null>(null);

  form: Partial<Cliente> = {
    nome: '',
    entidade: '',
    nuit: '',
    endereco: ''
  };

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      this.clientes.set(await this.clienteService.getClientes());
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  openModal() {
    this.isEditing.set(false);
    this.form = { nome: '', entidade: '', nuit: '', endereco: '' };
    this.isModalOpen.set(true);
    this.error.set(null);
  }

  editCliente(cliente: Cliente) {
    this.isEditing.set(true);
    this.form = { ...cliente };
    this.isModalOpen.set(true);
    this.error.set(null);
  }

  async viewDetails(cliente: Cliente) {
    this.selectedCliente.set(cliente);
    this.loadingFacturas.set(true);
    try {
      const facturas = await this.facturaService.getFacturasByCliente(cliente.id);
      this.clientFacturas.set(facturas);
    } catch (e) {
      console.error('Erro ao carregar facturas do cliente:', e);
      this.clientFacturas.set([]);
    } finally {
      this.loadingFacturas.set(false);
    }
  }

  closeDetails() {
    this.selectedCliente.set(null);
    this.clientFacturas.set([]);
  }

  async deleteCliente(cliente: Cliente) {
    if (confirm(`Tem certeza que deseja eliminar o cliente ${cliente.nome}?`)) {
      try {
        await this.clienteService.excluirCliente(cliente.id);
        await this.loadData();
      } catch (e) {
        alert('Erro ao eliminar cliente. Verifique se existem faturas vinculadas.');
      }
    }
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async onSubmit() {
    if (!this.form.nome || !this.form.entidade || !this.form.nuit || !this.form.endereco) {
      this.error.set('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    try {
      if (this.isEditing() && this.form.id) {
        await this.clienteService.atualizarCliente(this.form.id, this.form);
      } else {
        await this.clienteService.cadastrarCliente(this.form as any);
      }
      await this.loadData();
      this.closeModal();
    } catch (e: any) {
      this.error.set(e.message || 'Erro ao guardar cliente.');
    } finally {
      this.submitting.set(false);
    }
  }
}
