import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../core/models';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Gestão de Clientes</h2>
        <p class="text-gray-500 text-sm">Registo e listagem de entidades clientes</p>
      </div>
      <button 
        (click)="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-all flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Adicionar Cliente
      </button>
    </div>

    <!-- Tabela de Clientes -->
    <div class="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Entidade</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">NUIT</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Endereço</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr *ngFor="let cliente of clientes()" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{cliente.nome}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{cliente.entidade}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{{cliente.nuit}}</td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{{cliente.endereco}}</td>
            </tr>
            <tr *ngIf="clientes().length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p>Nenhum cliente registado no sistema.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Adicionar Cliente -->
    <div *ngIf="isModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">Novo Cliente</h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
            <input type="text" name="nome" [(ngModel)]="newCliente.nome" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Entidade</label>
            <input type="text" name="entidade" [(ngModel)]="newCliente.entidade" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">NUIT</label>
            <input type="text" name="nuit" [(ngModel)]="newCliente.nuit" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <textarea name="endereco" [(ngModel)]="newCliente.endereco" rows="3" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" (click)="closeModal()"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button type="submit"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ClientesListComponent {
  clientes = signal<Cliente[]>([]);
  isModalOpen = signal(false);

  newCliente: Partial<Cliente> = {
    nome: '',
    entidade: '',
    nuit: '',
    endereco: ''
  };

  openModal() {
    this.newCliente = { nome: '', entidade: '', nuit: '', endereco: '' };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onSubmit() {
    if (this.newCliente.nome && this.newCliente.entidade && this.newCliente.nuit && this.newCliente.endereco) {
      const clienteToAdd: Cliente = {
        ...this.newCliente as Cliente,
        id: 'CL-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        dataCriacao: new Date()
      };
      
      this.clientes.update(current => [...current, clienteToAdd]);
      this.closeModal();
    }
  }
}
