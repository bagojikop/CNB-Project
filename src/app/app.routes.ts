import { Routes } from '@angular/router';
import { authGuard, firstAdminSetupGuard, loginGuard } from './shared/services/auth.guard';

export const routes: Routes = [
  {
    path: 'setup/admin',
    canActivate: [firstAdminSetupGuard],
    loadComponent: () =>
      import('./features/auth/admin-setup/admin-setup.component').then(
        (m) => m.AdminSetupComponent,
      ),
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'apps/email',
    loadComponent: () => import('./layout').then((m) => m.EmailLayoutComponent),
  },

  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./layout').then((m) => m.DefaultLayoutComponent),
    data: {
      title: 'Home',
    },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
        children: [
          {
            path: 'dashboard-form',
            loadChildren: () =>
              import('./routes/dashboard/dashboard.module').then(
                (m) => m.DashboardModule,
              ),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/auth/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
        data: { title: 'Profile' },
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
        data: { title: 'Change Password' },
      },
      {
        path: 'settings-form',
        loadChildren: () =>
          import('./routes/settings/settings.module').then(
            (m) => m.settingsModule,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
