import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, Role } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Header -->
      <div class="mb-10">
        <h2 class="text-3xl font-black text-gray-900 tracking-tight">Minha Conta</h2>
        <p class="text-gray-500 mt-1">Gerencie suas informações pessoais e segurança da conta.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar: User Info Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
            <div class="relative inline-block mb-6">
              <div class="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200 rotate-3">
                {{ user()?.name?.substring(0, 2)?.toUpperCase() }}
              </div>
              <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            
            <h3 class="text-xl font-black text-gray-900 mb-1">{{ user()?.name }}</h3>
            <p class="text-sm text-gray-500 mb-4">{{ user()?.email }}</p>
            
            <div class="inline-flex items-center px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
              {{ user()?.role }}
            </div>
          </div>
        </div>

        <!-- Main Form: Settings -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Profile Information -->
          <div class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 class="text-lg font-black text-gray-900 uppercase tracking-tight">Informações do Perfil</h3>
              </div>
              <button *ngIf="!isEditingProfile()" (click)="enableProfileEdit()" class="text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-all">
                EDITAR PERFIL
              </button>
            </div>
            
            <div class="p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input type="text" [(ngModel)]="editForm.name" [disabled]="!isEditingProfile()"
                         class="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Endereço de E-mail</label>
                  <input type="email" [(ngModel)]="editForm.email" disabled
                         class="w-full px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed">
                </div>
              </div>
              
              <div *ngIf="isEditingProfile()" class="flex justify-end gap-3">
                <button (click)="cancelProfileEdit()" class="px-6 py-3.5 bg-gray-100 text-gray-500 text-xs font-black rounded-2xl hover:bg-gray-200 transition-all">
                  CANCELAR
                </button>
                <button (click)="updateProfile()" 
                        [disabled]="isUpdating()"
                        class="px-8 py-3.5 bg-blue-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
                  {{ isUpdating() ? 'GRAVANDO...' : 'GUARDAR ALTERAÇÕES' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Security Section -->
          <div class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-6 bg-rose-600 rounded-full"></div>
                <h3 class="text-lg font-black text-gray-900 uppercase tracking-tight">Segurança e Senha</h3>
              </div>
              <button (click)="showPasswords.set(!showPasswords())" class="text-[10px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase flex items-center gap-2">
                <svg *ngIf="!showPasswords()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                <svg *ngIf="showPasswords()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.04m5.813-1.423A3 3 0 1112.458 12m1.538 1.538l4.036 4.036M21 21l-4.036-4.036M21 21L12 12m9-9l-9 9m0 0L3 3"></path></svg>
                {{ showPasswords() ? 'Ocultar Senhas' : 'Ver Senhas' }}
              </button>
            </div>
            
            <div class="p-8 space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha Actual <span class="text-rose-500">*</span></label>
                <input [type]="showPasswords() ? 'text' : 'password'" [(ngModel)]="passwordForm.currentPassword"
                       class="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all shadow-sm"
                       placeholder="Confirme a sua senha actual para proceder">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nova Senha</label>
                  <input [type]="showPasswords() ? 'text' : 'password'" [(ngModel)]="passwordForm.newPassword"
                         class="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-rose-500 transition-all">
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                  <input [type]="showPasswords() ? 'text' : 'password'" [(ngModel)]="passwordForm.confirmPassword"
                         class="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-rose-500 transition-all">
                </div>
              </div>
              
              <div *ngIf="passwordError()" class="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold">
                {{ passwordError() }}
              </div>
              <div *ngIf="passwordSuccess()" class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-xs font-bold">
                Senha actualizada com sucesso!
              </div>

              <div class="flex justify-end">
                <button (click)="updatePassword()" 
                        [disabled]="isUpdatingPassword() || !passwordForm.currentPassword"
                        class="px-8 py-3.5 bg-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50">
                  {{ isUpdatingPassword() ? 'VALIDANDO...' : 'ALTERAR SENHA' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  
  user = signal<User | null>(null);
  isEditingProfile = signal(false);
  isUpdating = signal(false);
  isUpdatingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal(false);
  showPasswords = signal(false);

  editForm = {
    name: '',
    email: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.set(user);
        this.resetEditForm();
      }
    });
  }

  resetEditForm() {
    const user = this.user();
    if (user) {
      this.editForm.name = user.name;
      this.editForm.email = user.email;
    }
  }

  enableProfileEdit() {
    this.isEditingProfile.set(true);
  }

  cancelProfileEdit() {
    this.isEditingProfile.set(false);
    this.resetEditForm();
  }

  async updateProfile() {
    if (!this.editForm.name.trim()) return;
    
    this.isUpdating.set(true);
    try {
      await this.authService.updateProfile({ name: this.editForm.name });
      this.isEditingProfile.set(false);
      alert('Perfil actualizado com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao actualizar perfil.');
    } finally {
      this.isUpdating.set(false);
    }
  }

  async updatePassword() {
    if (!this.passwordForm.currentPassword) {
      this.passwordError.set('Deve informar a sua senha actual.');
      return;
    }

    if (!this.passwordForm.newPassword || this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.set('As novas senhas não coincidem.');
      return;
    }
    
    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError.set('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.isUpdatingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    
    try {
      // 1. Verify current password
      const { error: reauthError } = await this.authService.reauthenticate(this.passwordForm.currentPassword);
      if (reauthError) {
        this.passwordError.set(reauthError);
        return;
      }

      // 2. Update to new password
      await this.authService.updatePassword(this.passwordForm.newPassword);
      this.passwordSuccess.set(true);
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (e) {
      console.error(e);
      this.passwordError.set('Erro ao alterar senha. Tente novamente.');
    } finally {
      this.isUpdatingPassword.set(false);
    }
  }
}
