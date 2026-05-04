import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User, Role } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">ProCon Prototype</h2>
        <p class="mt-2 text-center text-sm text-gray-600">Simulação de Login</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" (ngSubmit)="onLogin()">
            <div>
              <label for="user" class="block text-sm font-medium text-gray-700">Selecione o Perfil a Testar</label>
              <div class="mt-1">
                <select id="user" name="user" [(ngModel)]="selectedUserId" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option *ngFor="let user of users" [value]="user.id">
                    {{ user.name }} ({{ user.role }})
                  </option>
                </select>
              </div>
            </div>

            <div>
              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Entrar no Sistema
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  users: User[] = this.authService.getUsers();
  selectedUserId: string = this.users[0]?.id;

  onLogin() {
    if (this.selectedUserId) {
      this.authService.login(this.selectedUserId);
      const user = this.authService.currentUserValue;
      
      if (user) {
        if (user.role === Role.SOLICITANTE_OBRAS) {
          this.router.navigate(['/requisitions']);
        } else if (user.role === Role.ADMINISTRACAO) {
          this.router.navigate(['/approvals/admin']);
        } else if (user.role === Role.PCA) {
          this.router.navigate(['/approvals/pca']);
        }
      }
    }
  }
}
