import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="h-screen flex flex-col bg-gray-900 text-white shadow-xl flex-shrink-0 transition-transform duration-300 ease-in-out
             fixed inset-y-0 left-0 z-40 w-64
             lg:static lg:translate-x-0"
      [class.-translate-x-full]="!isOpen"
      [class.translate-x-0]="isOpen">

      <div class="flex items-center justify-between h-14 sm:h-16 border-b border-gray-800 px-4">
        <span class="text-xl font-bold uppercase tracking-wider text-blue-400">ProCon</span>
        <!-- Close button (mobile only) -->
        <button
          (click)="closeSidebar.emit()"
          class="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="px-4 py-4 mb-4 border-b border-gray-800 text-sm">
        <div class="text-gray-400">Usuário Logado:</div>
        <div class="font-medium truncate">{{ (authService.currentUser$ | async)?.name }}</div>
        <div class="text-xs text-blue-400 mt-1">{{ (authService.currentUser$ | async)?.role }}</div>
      </div>
      
      <nav class="flex-1 px-4 space-y-2 overflow-y-auto">
        <ng-container *ngIf="isSolicitante || isAdmin">
          <a routerLink="/requisitions" routerLinkActive="bg-gray-800 text-white" class="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors">
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Minhas Requisições
          </a>
        </ng-container>

        <ng-container *ngIf="isAdmin">
          <a routerLink="/approvals/admin" routerLinkActive="bg-gray-800 text-white" class="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors">
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Aprovação Admin
          </a>
        </ng-container>

        <ng-container *ngIf="isPca">
          <a routerLink="/dashboard" routerLinkActive="bg-gray-800 text-white" class="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors">
            <svg class="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
            Visão Global (Dashboard)
          </a>
          <a routerLink="/approvals/pca" routerLinkActive="bg-gray-800 text-white" class="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors mt-1">
            <svg class="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Despacho PCA
          </a>
        </ng-container>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <button (click)="logout()" class="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-gray-800 transition-colors">
          <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Sair
        </button>
      </div>
    </div>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  router = inject(Router);

  get isSolicitante(): boolean {
    return this.authService.hasRole(Role.SOLICITANTE_OBRAS);
  }

  get isAdmin(): boolean {
    return this.authService.hasRole(Role.ADMINISTRACAO);
  }

  get isPca(): boolean {
    return this.authService.hasRole(Role.PCA);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
