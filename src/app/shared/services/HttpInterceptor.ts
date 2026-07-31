import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { MyProvider } from './provider';
import { CompanyInfo } from '@shared-interfaces/commans/company-report-navs';

import { ApiLoadingService, SHOW_LOADING_SPINNER } from './api-loading.service';

@Injectable()
export class ApiLoadingInterceptor implements HttpInterceptor {
  constructor(private loading: ApiLoadingService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (!req.context.get(SHOW_LOADING_SPINNER)) return next.handle(req);

    this.loading.requestStarted();
    return next
      .handle(req)
      .pipe(finalize(() => this.loading.requestFinished()));
  }
}

@Injectable()
export class ZoneInterceptor implements HttpInterceptor {
  constructor(private ngZone: NgZone) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          // Run response handling inside Angular zone globally
          this.ngZone.run(() => {});
        }
      }),
    );
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private provider: MyProvider,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (this.router.url === '/login') {
      return next.handle(req);
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.provider.companyInfo = <CompanyInfo>{};
          this.router.navigate(['/login'], {
            state: {
              message:
                'You have been logged out because your account logged in elsewhere.',
            },
          });
        }
        return throwError(() => error);
      }),
    );
  }
}
