import { Pipe, PipeTransform, inject } from '@angular/core';
import { DssLocaleService } from '@shared-services/common';

export interface DssInputNumPipeOptions {
  fraction?: string | number;
  currency?: boolean;
  locale?: string | null;
  currencyCode?: string | null;
  currencyDisplay?: 'code' | 'symbol' | 'narrowSymbol' | 'name';
}

@Pipe({
  name: 'dssInputNum',
  standalone: true,
})
export class DssInputNumPipe implements PipeTransform {
  private readonly localeService = inject(DssLocaleService);

  transform(
    value: number | string | null | undefined,
    optionsOrFraction: DssInputNumPipeOptions | string | number = 0,
    currency = false,
    currencyCode: string | null = null
  ): string {
    if (value === null || value === undefined || value === '') return '';

    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return '';

    const options = this.normalizeOptions(optionsOrFraction, currency, currencyCode);
    const fraction = Number(options.fraction ?? 0);
    const locale = options.locale ?? this.localeService.locale();

    if (!options.currency) {
      return numberValue.toFixed(fraction);
    }

    if (options.currencyCode) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: options.currencyCode,
        currencyDisplay: options.currencyDisplay ?? 'symbol',
        minimumFractionDigits: fraction,
        maximumFractionDigits: fraction,
      }).format(numberValue);
    }

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    }).format(numberValue);
  }

  private normalizeOptions(
    optionsOrFraction: DssInputNumPipeOptions | string | number,
    currency: boolean,
    currencyCode: string | null
  ): DssInputNumPipeOptions {
    if (typeof optionsOrFraction === 'object' && optionsOrFraction !== null) {
      return optionsOrFraction;
    }

    return {
      fraction: optionsOrFraction,
      currency,
      currencyCode,
    };
  }
}
