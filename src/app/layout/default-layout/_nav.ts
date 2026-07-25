import { INavData } from '@coreui/angular-pro';
import { adminNavItems } from './default-aside/sidar-bar/_admin';

export const dashboardNavItem: INavData = {
  name: 'Dashboard',
  url: '/dashboard',
  iconComponent: { name: 'cil-speedometer' },
  badge: {
    color: 'info',
    text: 'NEW',
  },
};

export const moduleNavItems: Record<string, INavData[]> = {
  Admin: adminNavItems,
};

export const navItems: INavData[] = [dashboardNavItem, ...adminNavItems];
