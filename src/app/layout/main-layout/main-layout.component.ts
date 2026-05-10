import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden relative">
      <!-- Mobile Backdrop -->
      <div
        *ngIf="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
        (click)="sidebarOpen = false">
      </div>

      <!-- Sidebar -->
      <app-sidebar
        [isOpen]="sidebarOpen"
        (closeSidebar)="sidebarOpen = false">
      </app-sidebar>
      
      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-y-auto w-full min-w-0">
        <!-- Header -->
        <header class="bg-white shadow-sm h-14 sm:h-16 flex items-center px-4 sm:px-6 lg:px-8 flex-shrink-0">
            <!-- Mobile Hamburger -->
            <button
              (click)="sidebarOpen = !sidebarOpen"
              class="lg:hidden mr-3 p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 class="text-base sm:text-lg font-medium text-gray-800 truncate">Sistema Logístico e Workflow</h1>
        </header>

        <!-- Route Outlet -->
        <div class="p-4 sm:p-6 lg:p-8 flex-1">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarOpen = false;

  constructor(private router: Router) {
    // Close sidebar on navigation (mobile)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.sidebarOpen = false;
    });
  }
}
