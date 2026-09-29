import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';
import { Http } from './httpService';
import { MyProvider } from './provider';

interface Firm { firm_code: number; firm_name: string; }
interface Branch { branch_code: string; branch_name: string; }
export interface FirstAdminRegistration {
  username: string;
  phone: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly httpClient = inject(HttpClient);
  private readonly contextStorageKey = 'authContext';
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: Http,
    private provider: MyProvider,
    private router: Router,
  ) { }

  hasToken(): boolean {
    return (
      this.isBrowser &&
      !!localStorage.getItem('token') &&
      !!localStorage.getItem(this.contextStorageKey)
    );
  }

  login(entity: { username: string; password: string }): Observable<apiResponse> {
    return this.http.post<apiResponse>('auth/login', entity).pipe(
      switchMap((res: apiResponse) => {
        if (res.status_cd !== 1) return of(res);

        const payload = res.data ?? {};
        const client = payload.client ?? {};
        const userId = client.id;

        const branchId = client.branch_code ?? ''
        const token = payload.token;
        const companyInfo = (this.provider.companyInfo ??= {} as any);

        companyInfo.user = { ...client, user_id: userId, access_token: token };
        if (this.isBrowser) localStorage.setItem('token', token);

        return forkJoin({

          branches: this.httpClient.get<Branch[]>('assets/data/branches.json').pipe(catchError(() => of([] as Branch[]))),
        }).pipe(
          map(({ branches }) => {
            companyInfo.company = {
              branch_id: branchId,
              branch_name: branches.find((branch) => String(branch.branch_code) === String(branchId))?.branch_name ?? '',


            };
            this.storeContext();
            this.isAuthenticatedSubject.next(true);
            void this.router.navigateByUrl('/dashboard');
            return res;
          }),
        );
      }),
    );
  }

  findPasswordRecoveryAccount(identifier: string): Observable<apiResponse> {
    return this.http.post<apiResponse>('auth/forgot-password', { userName: identifier });
  }

  getSetupStatus(): Observable<boolean> {
    return this.http.get<apiResponse>(
      'auth/setup-status',
      undefined,
      { isLoadingSpinner: false },
    ).pipe(
      map((res) =>
        Boolean(res?.data?.setupRequired ?? res?.data?.setup_required),
      ),
    );
  }

  createFirstAdmin(entity: FirstAdminRegistration): Observable<apiResponse> {
    return this.http.post<apiResponse>('auth/setup-admin', entity);
  }

  verifyPasswordRecoveryOtp(userName: string, recoveryToken: string, otp: string): Observable<apiResponse> {
    return this.http.post<apiResponse>('auth/verify-reset-otp', { userName, recoveryToken, otp });
  }

  resetForgottenPassword(recoveryToken: string, temporaryPassword: string, newPassword: string): Observable<apiResponse> {
    return this.http.post<apiResponse>('auth/reset-forgotten-password', {
      recoveryToken,
      temporaryPassword,
      newPassword,
      newPasswordConfirmation: newPassword,
    });
  }

  restoreSession(): Observable<void> {
    if (!this.isBrowser) return of(void 0);
    const token = localStorage.getItem('token');
    const storedContext = localStorage.getItem(this.contextStorageKey);
    if (!token || !storedContext) {
      this.clearStoredSession();
      this.isAuthenticatedSubject.next(false);
      return of(void 0);
    }

    try {
      const context = JSON.parse(storedContext);
      if (!context?.user) throw new Error('Invalid authentication context.');

      this.provider.companyInfo = context;
      this.provider.companyInfo!.user.access_token = token;
      this.isAuthenticatedSubject.next(true);
    } catch {
      this.clearStoredSession();
      this.provider.companyInfo = {} as any;
      this.isAuthenticatedSubject.next(false);
    }
    return of(void 0);
  }

  startFreshSession(): Observable<void> {
    this.clearStoredSession();
    this.provider.companyInfo = {} as any;
    this.isAuthenticatedSubject.next(false);
    return of(void 0);
  }

  loginForDevelopment(): Observable<apiResponse> {
    return this.login({ username: 'Rakesh', password: 'abcd' });
  }

  logout(): void {
    this.clearStoredSession();
    this.provider.companyInfo = {} as any;
    this.isAuthenticatedSubject.next(false);
    void this.router.navigateByUrl('/login');
  }

  isAuthenticated(): boolean { return this.isAuthenticatedSubject.value; }

  isAdmin(): boolean {
    return this.isAuthenticated() && Number(this.provider.companyInfo?.user?.role) === 1;
  }

  private storeContext(): void {
    if (this.isBrowser) localStorage.setItem(this.contextStorageKey, JSON.stringify(this.provider.companyInfo));
  }

  private clearStoredSession(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('token');
    localStorage.removeItem(this.contextStorageKey);
  }
}
