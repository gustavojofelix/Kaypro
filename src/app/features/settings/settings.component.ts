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
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Papel</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
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
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button (click)="viewDetails(user)" class="text-gray-600 hover:text-gray-900 bg-gray-100 p-1.5 rounded-md transition-colors" title="Ver Detalhes">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </button>
                      <button (click)="editUser(user)" class="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors" title="Editar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button (click)="deleteUser(user)" class="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors" title="Eliminar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for New/Edit User -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing() ? 'Editar Utilizador' : 'Adicionar Novo Utilizador' }}</h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="saveUser()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="newUser.name" name="name" required class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
          </div>
          <div *ngIf="!isEditing()">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email <span class="text-red-500">*</span></label>
            <input type="email" [(ngModel)]="newUser.email" name="email" required class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Papel (Role) <span class="text-red-500">*</span></label>
            <select [(ngModel)]="newUser.role" name="role" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
              <option value="SOLICITANTE_OBRAS">Solicitante de Obras</option>
              <option value="ADMINISTRACAO">Administração</option>
              <option value="PCA">PCA</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Empresa <span class="text-red-500">*</span></label>
            <select [(ngModel)]="newUser.companyId" name="companyId" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
              <option *ngFor="let company of companies()" [value]="company.id">{{ company.name }}</option>
            </select>
          </div>

          <div *ngIf="error()" class="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            {{ error() }}
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" (click)="closeModal()" class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" [disabled]="submitting()" class="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all active:scale-95">
              {{ submitting() ? 'Salvando...' : (isEditing() ? 'Atualizar' : 'Salvar Utilizador') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for User Details -->
    <div *ngIf="userDetails()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 rounded-t-2xl">
          <h3 class="text-lg font-bold text-white">Detalhes do Utilizador</h3>
          <button (click)="userDetails.set(null)" class="text-blue-100 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <div class="flex flex-col items-center pb-6 border-b border-gray-50">
            <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-3">
              {{ userDetails()?.name?.substring(0, 2)?.toUpperCase() }}
            </div>
            <h4 class="text-xl font-bold text-gray-900">{{ userDetails()?.name }}</h4>
            <p class="text-sm text-gray-500">{{ userDetails()?.email || 'N/A' }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-xs font-semibold text-gray-400 uppercase">Papel / Cargo</p>
              <p class="text-sm font-bold text-gray-900">{{ userDetails()?.role }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-semibold text-gray-400 uppercase">Empresa</p>
              <p class="text-sm font-bold text-gray-900">{{ getCompanyName(userDetails()?.companyId) }}</p>
            </div>
            <div class="space-y-1 col-span-2">
              <p class="text-xs font-semibold text-gray-400 uppercase">ID do Utilizador</p>
              <p class="text-xs font-mono text-gray-500 bg-gray-50 p-2 rounded-lg">{{ userDetails()?.id }}</p>
            </div>
          </div>

          <div class="pt-4">
            <button (click)="userDetails.set(null)" class="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private companyService = inject(CompanyService);

  companies = signal<Company[]>([]);
  users = signal<User[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  userDetails = signal<User | null>(null);
  submitting = signal(false);
  error = signal<string | null>(null);

  editingUserId: string | null = null;
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
      if (this.companies().length > 0 && !this.isEditing()) {
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
    this.isEditing.set(false);
    this.editingUserId = null;
    this.newUser = { name: '', email: '', role: Role.SOLICITANTE_OBRAS, companyId: this.companies()[0]?.id || '' };
    this.showModal.set(true);
    this.error.set(null);
  }

  editUser(user: User) {
    this.isEditing.set(true);
    this.editingUserId = user.id;
    this.newUser = {
      name: user.name,
      email: user.email, // Email won't be editable but helps display
      role: user.role,
      companyId: user.companyId || ''
    };
    this.showModal.set(true);
    this.error.set(null);
  }

  viewDetails(user: User) {
    this.userDetails.set(user);
  }

  async deleteUser(user: User) {
    if (confirm(`Tem certeza que deseja eliminar o utilizador ${user.name}? Esta ação removerá apenas o perfil do sistema.`)) {
      try {
        await this.companyService.deleteUser(user.id);
        await this.loadData();
      } catch (e: any) {
        alert('Erro ao eliminar utilizador: ' + e.message);
      }
    }
  }

  closeModal() {
    this.showModal.set(false);
  }

  async saveUser() {
    if (!this.newUser.name || (!this.isEditing() && !this.newUser.email)) {
      this.error.set('Por favor preencha os campos obrigatórios.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      if (this.isEditing() && this.editingUserId) {
        await this.companyService.updateUser(this.editingUserId, {
          name: this.newUser.name,
          role: this.newUser.role,
          companyId: this.newUser.companyId
        });
      } else {
        await this.companyService.addUser(this.newUser);
      }
      await this.loadData();
      this.closeModal();
    } catch (e: any) {
      this.error.set(e.message || 'Erro ao guardar utilizador.');
    } finally {
      this.submitting.set(false);
    }
  }
}

