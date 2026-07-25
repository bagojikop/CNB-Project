import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'apps/email',
    loadComponent: () => import('./layout').then((m) => m.EmailLayoutComponent),
  },

  {
    path: '',
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
  { path: '**', redirectTo: 'dashboard' },
];
