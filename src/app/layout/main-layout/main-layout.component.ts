import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>
      
      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-y-auto">
        <!-- Header -->
        <header class="bg-white shadow-sm h-16 flex items-center px-8">
            <h1 class="text-lg font-medium text-gray-800">Sistema Logístico e Workflow</h1>
        </header>

        <!-- Route Outlet -->
        <div class="p-8 flex-1">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class MainLayoutComponent {}
