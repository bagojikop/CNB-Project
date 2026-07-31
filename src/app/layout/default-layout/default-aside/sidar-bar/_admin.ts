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
      {
        name: 'VAN Creation',
        url: '/settings-form/userMgtDashboard',
        icon: 'cil-globe-alt',
      },
      {
        name: 'Balance Inquiry',
        url: '/settings-form/userMgtDashboard',
        icon: 'cil-credit-card',
      },
      {
        name: 'VAN Statement',
        url: '/settings-form/userMgtDashboard',
        icon: 'cil-file',
      },
      {
        name: 'Modify VAN',
        url: '/settings-form/userMgtDashboard',
        icon: 'cil-pencil',
      },
      {
        name: 'Retrieve VAN',
        url: '/settings-form/userMgtDashboard',
        icon: 'cil-cloud-download',
      },
      {
        name: 'Push Checker Maker',
        url: '/settings-form/userMgtDashboard',
        icon: 'cil-sync',
      },
    ],
  },
];
