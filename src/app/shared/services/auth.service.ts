import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  switchMap,
} from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';
import { UserPermissions } from './common';
import { Http } from './httpService';
import { MyProvider } from './provider';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSrc = inject(UserService);
  //   private url = 'http://localhost:3000/students';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken(),
  );
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: Http,
    private provider: MyProvider,
    private router: Router,
    private userAccessCtrl: UserPermissions,
  ) {}
  //@Inject(PLATFORM_ID) private platformId: Object

  hasToken(): boolean {
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId)) {
      return !!localStorage.getItem('token');
    }
    return false; // or handle differently for SSR
  }

  login(entity: any): Observable<apiResponse> {
    return this.http.post('auth/login', entity).pipe(
      switchMap((res: apiResponse) => {
        if (res.status_cd !== 1) {
          return [res];
        }
        const companyInfo = (this.provider.companyInfo ??= {} as any);
        const { id, ...client } = res.data.client;
        companyInfo.user = client;
        companyInfo.user.user_id = id;
        companyInfo.user.access_token = res.data.token;
        localStorage.setItem('token', res.data.token);
        companyInfo.company = {} as any;
        companyInfo.company.firm_id = 101;
        companyInfo.company.branch_id = '101';
        companyInfo.company.div_id = 20262027;
        companyInfo.company.fdt = '2026/04/01';
        companyInfo.company.tdt = '2027/03/31';
        // const auditAccess = res.data.user.modules?.filter((x: any) => x.moduleId == 3) ?? [];
        // if (auditAccess.length > 0) {
        //   this.router.navigate(['selectfirm']);
        //   return [res];
        // }
        // companyInfo.company = res.data.firm;
        // companyInfo.finYear = {
        //   fdt: new Date(res.data.finyear.fdt),
        //   tdt: new Date(res.data.finyear.tdt),
        // };
        return this.http.get('user/usergrants', { userid: id }).pipe(
          switchMap((grantsRes: any) => {
            const grants = grantsRes?.data ?? grantsRes ?? {};
            companyInfo.user.grants = grants;
            this.userAccessCtrl.setInfo(grants);
            return this.http.get('Setting/list').pipe(
              catchError(() => of({ data: [] } as apiResponse)),
              map((settingsRes: apiResponse) => {
                const company = (companyInfo.company ??= {});
                company.settings = settingsRes.data;
                this.isAuthenticatedSubject.next(true);
                this.router.navigate(['dashboard']);
                return res;
              }),
            );
          }),
        );
      }),
    );
  }

  loginForDevelopment() {
    // return this.login({
    //   username: 'admin',
    //   password: 'zakkas@@',
    // });

    return this.userSrc.getByAuth('Sss', 'asbcd');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
