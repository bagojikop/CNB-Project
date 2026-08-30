import { INavData } from '@coreui/angular-pro';

export const adminNavItems: INavData[] = [
  {
    name: 'Settings',
    url: '/settings',
    iconComponent: { name: 'cil-task' },
    children: [
      {
        name: 'Configuration',
        url: '/settings-form/bankAccountDashboard',
        icon: 'cil-settings',
      },
      {
        name: 'User Management',
        url: '/settings-form/userMgtDashboard',
        icon: 'cil-User',
      },
      {
        name: 'VAN Creation',
        url: '/settings-form/vanCreationDashboard',
        icon: 'cil-globe-alt',
      },
      {
        name: 'Balance Inquiry',
        url: '/settings-form/BalanceInquiry',
        icon: 'cil-credit-card',
      },
      {
        name: 'Account Statement',
        url: '/settings-form/accStatement',
        icon: 'cil-file',
      },
      {
        name: 'Modify VAN',
        url: '/settings-form/vanModify',
        icon: 'cil-pencil',
      },
      {
        name: 'Retrieve VAN',
        url: '/settings-form/vanRetrieve',
        icon: 'cil-cloud-download',
      },
      {
        name: 'Push Checker Maker',
        url: '/settings-form/pushCheckerMaker',
        icon: 'cil-sync',
      },
    ],
  },
];
