import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DssDateFinService {
  private readonly fromDateSignal = signal<string | null>(null);
  private readonly toDateSignal = signal<string | null>(null);

  readonly fromDate = this.fromDateSignal.asReadonly();
  readonly toDate = this.toDateSignal.asReadonly();

  setDateRange(fromDate: string | Date | null, toDate: string | Date | null): void {
    this.fromDateSignal.set(this.toDateInputValue(fromDate));
    this.toDateSignal.set(this.toDateInputValue(toDate));
  }

  setConfig(config: { fromDate?: string | Date | null; toDate?: string | Date | null }): void {
    if ('fromDate' in config || 'toDate' in config) {
      this.setDateRange(config.fromDate ?? null, config.toDate ?? null);
    }
  }

  private toDateInputValue(value: string | Date | null): string | null {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);

    return value;
  }
}
