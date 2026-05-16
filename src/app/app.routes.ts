import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'requisitions', pathMatch: 'full' },
      {
        path: 'requisitions',
        loadComponent: () => import('./features/requisitions/requisitions-list/requisitions-list.component').then(m => m.RequisitionsListComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.SOLICITANTE_OBRAS, Role.ADMINISTRACAO] }
      },
      {
        path: 'requisitions/new',
        loadComponent: () => import('./features/requisitions/requisition-form/requisition-form.component').then(m => m.RequisitionFormComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.SOLICITANTE_OBRAS, Role.ADMINISTRACAO] }
      },
      {
        path: 'viaturas',
        loadComponent: () => import('./features/viaturas/viaturas-list.component').then(m => m.ViaturaListComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.SOLICITANTE_OBRAS, Role.ADMINISTRACAO] }
      },
      {
        path: 'approvals/admin',
        loadComponent: () => import('./features/approvals/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.ADMINISTRACAO] }
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pca-analytics/pca-analytics.component').then(m => m.PcaAnalyticsComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.PCA] }
      },
      {
        path: 'approvals/pca',
        loadComponent: () => import('./features/approvals/pca-dashboard/pca-dashboard.component').then(m => m.PcaDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.PCA] }
      },
      {
        path: 'facturacao',
        loadComponent: () => import('./features/facturacao/facturacao.component').then(m => m.FacturacaoComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.ADMINISTRACAO, Role.PCA] }
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/clientes-list.component').then(m => m.ClientesListComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.ADMINISTRACAO, Role.PCA] }
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.PCA] }
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [roleGuard],
        data: { roles: [Role.SOLICITANTE_OBRAS, Role.ADMINISTRACAO, Role.PCA] }
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
