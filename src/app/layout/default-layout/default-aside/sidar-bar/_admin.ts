import { INavData } from '@coreui/angular-pro';

export const adminNavItems: INavData[] = [
  {
    name: 'Settings',
    url: '/settings',
    iconComponent: { name: 'cil-task' },
    children: [
      {
        name: 'Configuration',
        url: '/settings-form/confDashboard',
        icon: 'cil-settings',
      },
      {
        name: 'User Management',
        url: '/settings-form/userMgtDashboard',
        icon: 'cil-User',
      },
    ],
  },
];
