import { Component } from '@angular/core';
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
export class DefaultLayoutComponent {
  public readonly apiLoading = this.apiLoadingService.isLoading;
  public activeModuleTitle = this.getModuleTitle(
    'Settings',
    moduleNavItems['Settings'] ?? [],
  );
  public navItems = this.getModuleNavItems('Settings');

  constructor(private readonly apiLoadingService: ApiLoadingService) {}

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

    return this.normalizeNavIcons(
      this.unwrapSingleModuleDropdown(this.getVisibleNavItems(items)),
    );
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
