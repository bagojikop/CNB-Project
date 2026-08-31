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
  ) {}

  hasToken(): boolean {
    return this.isBrowser && !!localStorage.getItem('token');
  }

  login(entity: { username: string; password: string }): Observable<apiResponse> {
    return this.http.post('auth/login', entity).pipe(
      switchMap((res: apiResponse) => {
        if (res.status_cd !== 1) return of(res);

        const payload = res.data ?? {};
        const client = payload.client ?? payload.user ?? {};
        const userId = client.id ?? client.user_id;
        const firmId = client.firmId ?? client.firm_id ?? payload.firmId ?? payload.firm_id;
        const branchId = client.branchId ?? client.branch_id ?? payload.branchId ?? payload.branch_id;
        const token = payload.token;
        const companyInfo = (this.provider.companyInfo ??= {} as any);

        companyInfo.user = { ...client, user_id: userId, access_token: token };
        if (this.isBrowser) localStorage.setItem('token', token);

        return forkJoin({
          firms: this.httpClient.get<Firm[]>('data/firms.json').pipe(catchError(() => of([] as Firm[]))),
          branches: this.httpClient.get<Branch[]>('data/branches.json').pipe(catchError(() => of([] as Branch[]))),
        }).pipe(
          map(({ firms, branches }) => {
            companyInfo.company = {
              firm_id: firmId,
              firm_name: firms.find((firm) => String(firm.firm_code) === String(firmId))?.firm_name ?? '',
              branch_id: branchId,
              branch_name: branches.find((branch) => String(branch.branch_code) === String(branchId))?.branch_name ?? '',
              div_id: payload.div_id ?? 20262027,
              fdt: payload.fdt ?? '2026/04/01',
              tdt: payload.tdt ?? '2027/03/31',
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
    return this.http.post('auth/forgot-password', { userName: identifier });
  }

  verifyPasswordRecoveryOtp(userName: string, recoveryToken: string, otp: string): Observable<apiResponse> {
    return this.http.post('auth/verify-reset-otp', { userName, recoveryToken, otp });
  }

  resetForgottenPassword(recoveryToken: string, temporaryPassword: string, newPassword: string): Observable<apiResponse> {
    return this.http.post('auth/reset-forgotten-password', {
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
    if (!token || !storedContext) return of(void 0);

    try {
      this.provider.companyInfo = JSON.parse(storedContext);
      this.provider.companyInfo!.user.access_token = token;
      this.isAuthenticatedSubject.next(true);
    } catch {
      this.clearStoredSession();
    }
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

  private storeContext(): void {
    if (this.isBrowser) localStorage.setItem(this.contextStorageKey, JSON.stringify(this.provider.companyInfo));
  }

  private clearStoredSession(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('token');
    localStorage.removeItem(this.contextStorageKey);
  }
}
