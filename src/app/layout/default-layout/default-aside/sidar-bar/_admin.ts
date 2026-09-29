import { INavData } from '@coreui/angular-pro';

export const adminNavItems: INavData[] = [
  {
    name: 'Settings',
    url: '/settings',
    iconComponent: { name: 'cil-task' },
    children: [

      {
        name: 'Virtual Account Banking',
        url: '/settings-form/virtualAccounts',
        icon: 'cil-bank',
      },
      {
        name: 'Single Payment',
        url: '/dashboard/dashboard-form/singlePayment',
        icon: 'cil-credit-card',
      },
      {
        name: 'Bulk Payment',
        url: '/dashboard/dashboard-form/bulkPayment',
        icon: 'cil-list',
      },
      {
        name: 'VPA & QR Banking',
        url: '/dashboard/dashboard-form/vpa',
        icon: 'cil-qr-code',
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
      // {
      //   name: 'Push Checker',
      //   url: '/settings-form/pushCheckerMaker/pushMaker',
      //   icon: 'cil-sync',
      // },

      // {
      //   name: 'Push Maker',
      //   url: '/settings-form/pushCheckerMaker/pushInit',
      //   icon: 'cil-sync',
      // },
      {
        name: 'Settings',
        iconComponent: { name: 'cilSettings' },
        children: [
          {
            name: 'Configuration',
            url: '/settings-form/bankAccountDashboard',
            iconComponent: { name: 'cilSettings' },
          },
          {
            name: 'User Management',
            url: '/settings-form/userMgtDashboard',
            iconComponent: { name: 'cilUser' },
          },
        ],
      },
    ],
  },
];
