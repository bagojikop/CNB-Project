import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
} from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { firstValueFrom } from 'rxjs';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';

import { DropdownModule, SidebarModule } from '@coreui/angular-pro';
import { IconSetService } from '@coreui/icons-angular';
import { routes } from './app.routes';
import {
  ApiLoadingInterceptor,
  AuthInterceptor,
  ZoneInterceptor,
} from './shared/services/HttpInterceptor';
import { DSS_HTTP_SERVICE, Http } from './shared/services/httpService';
import { DssLocaleService } from './shared/services/common';
import { DssDateFinService } from './shared/services/dss-date-fin.service';
import { AuthService } from './shared/services/auth.service';
import { environment } from '../environments/environment';

export function initializeDssConfig(): void {
  const localeService = inject(DssLocaleService);
  const dateFinService = inject(DssDateFinService);

  localeService.setLocale('en-IN');
  localeService.setDateFormat('dd/mm/yyyy');
  dateFinService.setConfig({
    fromDate: '2026-04-01',
    toDate: '2027-03-31',
  });
}

export function initializeAuth(): Promise<void> | void {
  const auth = inject(AuthService);
  if (environment.autoDevLogin) {
    return firstValueFrom(auth.loginForDevelopment()).then(() => undefined);
  }
  return firstValueFrom(auth.restoreSession());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      withEnabledBlockingInitialNavigation(),
      withHashLocation(),
    ),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    importProvidersFrom(SidebarModule, DropdownModule),
    IconSetService,
    Http,
    {
      provide: DSS_HTTP_SERVICE,
      useExisting: Http,
    },
    provideAppInitializer(initializeDssConfig),
    provideAppInitializer(initializeAuth),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ZoneInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiLoadingInterceptor,
      multi: true,
    },
    provideAnimationsAsync(),
  ],
};
