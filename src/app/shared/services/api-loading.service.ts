import { HttpContextToken } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

export const SHOW_LOADING_SPINNER = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
export class ApiLoadingService {
  private activeRequests = 0;
  readonly isLoading = signal(false);

  requestStarted(): void {
    this.activeRequests += 1;
    this.isLoading.set(true);
  }

  requestFinished(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.isLoading.set(this.activeRequests > 0);
  }
}
