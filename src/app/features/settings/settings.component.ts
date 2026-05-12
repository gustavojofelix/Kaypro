import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { Company, User, Role } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Configurações do Sistema</h2>
        <p class="mt-2 text-sm text-gray-500">Gerencie suas empresas e utilizadores.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Companies List -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 bg-gray-50/50">
              <h3 class="text-lg font-bold text-gray-900">Minhas Empresas</h3>
            </div>
            <div class="p-6 space-y-4">
              <div *ngFor="let company of companies()" class="flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group">
                <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-600 transition-colors">
                  <svg class="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ company.name }}</p>
                  <p class="text-xs text-gray-500">ID: {{ company.id }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Management -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-900">Utilizadores</h3>
              <button (click)="openModal()" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Novo Utilizador
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Papel</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Empresa</th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr *ngFor="let user of users()" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-xs text-gray-500">{{ user.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            [ngClass]="{
                              'bg-purple-100 text-purple-800': user.role === 'PCA',
                              'bg-blue-100 text-blue-800': user.role === 'ADMINISTRACAO',
                              'bg-green-100 text-green-800': user.role === 'SOLICITANTE_OBRAS'
                            }">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ getCompanyName(user.companyId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button class="text-blue-600 hover:text-blue-900">Editar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for New User -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900">Adicionar Novo Utilizador</h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="saveUser()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo</label>
            <input type="text" [(ngModel)]="newUser.name" name="name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" [(ngModel)]="newUser.email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Papel (Role)</label>
            <select [(ngModel)]="newUser.role" name="role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="SOLICITANTE_OBRAS">Solicitante de Obras</option>
              <option value="ADMINISTRACAO">Administração</option>
              <option value="PCA">PCA</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Empresa</label>
            <select [(ngModel)]="newUser.companyId" name="companyId" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option *ngFor="let company of companies()" [value]="company.id">{{ company.name }}</option>
            </select>
          </div>

          <div *ngIf="error()" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{{ error() }}</div>

          <div class="flex gap-3 pt-4">
            <button type="button" (click)="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" [disabled]="submitting()" class="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {{ submitting() ? 'Salvando...' : 'Salvar Utilizador' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private companyService = inject(CompanyService);

  companies = signal<Company[]>([]);
  users = signal<User[]>([]);
  showModal = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  newUser = {
    name: '',
    email: '',
    role: Role.SOLICITANTE_OBRAS,
    companyId: ''
  };

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.companies.set(await this.companyService.getCompanies());
      this.users.set(await this.companyService.getAllUsers());
      if (this.companies().length > 0) {
        this.newUser.companyId = this.companies()[0].id;
      }
    } catch (e) {
      console.error(e);
    }
  }

  getCompanyName(id?: string): string {
    return this.companies().find(c => c.id === id)?.name || 'Sem Empresa';
  }

  openModal() {
    this.showModal.set(true);
    this.error.set(null);
  }

  closeModal() {
    this.showModal.set(false);
  }

  async saveUser() {
    if (!this.newUser.name || !this.newUser.email) {
      this.error.set('Por favor preencha todos os campos.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.companyService.addUser(this.newUser);
      await this.loadData();
      this.closeModal();
      this.newUser = { name: '', email: '', role: Role.SOLICITANTE_OBRAS, companyId: this.companies()[0]?.id || '' };
    } catch (e: any) {
      this.error.set(e.message || 'Erro ao salvar utilizador.');
    } finally {
      this.submitting.set(false);
    }
  }
}
