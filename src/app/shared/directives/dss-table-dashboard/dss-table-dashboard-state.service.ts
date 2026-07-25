import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DssTableDashboardStateService {
  private readonly loadedDashboards = new Set<string>();

  markLoaded(key: string): void {
    this.loadedDashboards.add(key);
  }

  hasLoaded(key: string): boolean {
    return this.loadedDashboards.has(key);
  }

  clear(key?: string): void {
    if (key) {
      this.loadedDashboards.delete(key);
      return;
    }

    this.loadedDashboards.clear();
  }
}
