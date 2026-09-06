import { Component, NgZone, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { INavData } from '@coreui/angular-pro';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonCloseDirective,
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular-pro';

import {
  DefaultAsideComponent,
  DefaultBreadcrumbComponent,
  DefaultFooterComponent,
  DefaultHeaderComponent,
} from './';
import { moduleNavItems, navItems } from './_nav';
import { ApiLoadingService } from '../../shared/services/api-loading.service';
import { MyProvider } from '../../shared/services/provider';
import { AuthService } from '../../shared/services/auth.service';
import { DialogsService } from '../../shared/services/messageBox';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    // ContainerComponent,
    DefaultAsideComponent,
    DefaultBreadcrumbComponent,
    DefaultFooterComponent,
    DefaultHeaderComponent,
    IconDirective,
    NgScrollbar,
    RouterOutlet,
    ShadowOnScrollDirective,
    ButtonCloseDirective,
  ],
})
export class DefaultLayoutComponent implements OnDestroy {
  private readonly idleTimeoutMs = 10 * 60 * 1000;
  private readonly warningTimeoutMs = 60 * 1000;
  private idleTimer?: ReturnType<typeof setTimeout>;
  private warningVisible = false;
  private lastActivityReset = 0;
  private readonly removeActivityListeners: Array<() => void> = [];

  public readonly apiLoading = this.apiLoadingService.isLoading;
  public activeModuleTitle = this.getModuleTitle(
    'Settings',
    moduleNavItems['Settings'] ?? [],
  );
  public navItems = this.getModuleNavItems('Settings');

  constructor(
    private readonly apiLoadingService: ApiLoadingService,
    private readonly provider: MyProvider,
    private readonly auth: AuthService,
    private readonly dialogs: DialogsService,
    private readonly zone: NgZone,
  ) {
    this.startIdleMonitoring();
  }

  ngOnDestroy(): void {
    this.clearIdleTimer();
    this.removeActivityListeners.forEach((remove) => remove());
  }

  private startIdleMonitoring(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];

    this.zone.runOutsideAngular(() => {
      for (const eventName of activityEvents) {
        const listener = () => this.onUserActivity();
        window.addEventListener(eventName, listener, { passive: true });
        this.removeActivityListeners.push(() =>
          window.removeEventListener(eventName, listener),
        );
      }

      const visibilityListener = () => {
        if (document.visibilityState === 'visible') this.onUserActivity();
      };
      document.addEventListener('visibilitychange', visibilityListener);
      this.removeActivityListeners.push(() =>
        document.removeEventListener('visibilitychange', visibilityListener),
      );
    });

    this.resetIdleTimer();
  }

  private onUserActivity(): void {
    if (this.warningVisible) return;

    const now = Date.now();
    if (now - this.lastActivityReset < 1_000) return;
    this.lastActivityReset = now;
    this.resetIdleTimer();
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(
      () => this.zone.run(() => void this.showIdleWarning()),
      this.idleTimeoutMs,
    );
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = undefined;
  }

  private async showIdleWarning(): Promise<void> {
    if (this.warningVisible) return;

    this.warningVisible = true;
    this.clearIdleTimer();
    const staySignedIn = await this.dialogs.confirmIdle(this.warningTimeoutMs);
    this.warningVisible = false;

    if (staySignedIn) {
      this.lastActivityReset = Date.now();
      this.resetIdleTimer();
      return;
    }

    this.auth.logout();
  }

  public selectModule(moduleName: string): void {
    const selectedItems = moduleNavItems[moduleName];
    if (selectedItems) {
      this.activeModuleTitle = this.getModuleTitle(moduleName, selectedItems);
      this.navItems = this.getModuleNavItems(moduleName);
      return;
    }

    this.activeModuleTitle = '';
    this.navItems = this.normalizeNavIcons(this.getVisibleNavItems(navItems));
  }

  private getModuleNavItems(moduleName: string): INavData[] {
    const items = moduleNavItems[moduleName] ?? navItems;
    const visibleItems = this.getVisibleNavItems(items);
    const unwrappedItems = this.unwrapSingleModuleDropdown(visibleItems);
    const filteredItems = this.filterNavItemsByRole(unwrappedItems);

    return this.normalizeNavIcons(filteredItems);
  }

  private filterNavItemsByRole(items: INavData[]): INavData[] {
    const userRole = Number(this.provider.companyInfo?.user?.role);
    const disabledName = userRole === 2
      ? 'push maker'
      : userRole === 3
        ? 'push checker'
        : '';

    if (!disabledName) return items;

    return items.map((item) => {
      const children = item.children?.length
        ? this.filterNavItemsByRole(item.children)
        : item.children;
      const shouldDisable = String(item.name ?? '').trim().toLowerCase() === disabledName;

      if (!shouldDisable) return { ...item, children };

      return {
        ...item,
        children,
        class: `${item.class ?? ''} sidebar-nav-item-disabled`.trim(),
        attributes: {
          ...item.attributes,
          'aria-disabled': 'true',
          tabindex: '-1',
        },
      };
    });
  }

  private getVisibleNavItems(items: INavData[]): INavData[] {
    return items.filter((item) => !item.title && item.name !== 'Dashboard');
  }

  private unwrapSingleModuleDropdown(items: INavData[]): INavData[] {
    if (items.length === 1 && items[0].children?.length) {
      return items[0].children;
    }

    return items;
  }

  private getModuleTitle(moduleName: string, items: INavData[]): string {
    const titleItem = items.find((item) => item.title);
    const title = titleItem?.name ?? moduleName;

    return title.toUpperCase().split('').join(' ');
  }

  private normalizeNavIcons(items: INavData[]): INavData[] {
    return items.map((item) => {
      const normalizedItem: INavData = { ...item };
      const iconName = this.normalizeIconName(
        normalizedItem.iconComponent?.name ?? normalizedItem.icon,
      );

      if (iconName) {
        normalizedItem.iconComponent = {
          ...normalizedItem.iconComponent,
          name: iconName,
        };
        delete normalizedItem.icon;
      }

      if (normalizedItem.children?.length) {
        normalizedItem.children = this.normalizeNavIcons(
          normalizedItem.children,
        );
      }

      return normalizedItem;
    });
  }

  private normalizeIconName(iconName?: string): string | undefined {
    if (!iconName?.startsWith('cil-')) {
      return undefined;
    }

    return iconName.replace(/-([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
  }
}
