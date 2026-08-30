import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { userMgt } from '@shared-interfaces/settings/user';
import { bankAccount } from '@shared-interfaces/settings/bankAccount';
import { CreateVANRequest } from '@shared-interfaces/settings/van-creation';
import { DataRefreshService } from './data-refresh.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private refreshService = inject(DataRefreshService);
  private api = 'http://localhost:3000/users';

  getAll(): Observable<userMgt[]> {
    return this.http.get<userMgt[]>(this.api);
  }

  add(user: userMgt): Observable<userMgt> {
    return this.http.post<userMgt>(this.api, user).pipe(
      map((response) => {
        this.refreshService.trigger();
        return response;
      }),
    );
  }

  update(user: userMgt): Observable<userMgt> {
    return this.http.put<userMgt>(`${this.api}/${user.id}`, user).pipe(
      map((response) => {
        this.refreshService.trigger();
        return response;
      }),
    );
  }

  getByAuth(username: string, password: string): Observable<userMgt> {
    return this.http
      .get<userMgt[]>(this.api, {
        params: {
          username: username,
          password: password,
        },
      })

      .pipe(map((users: any) => users[0]));
  }

  delete(id?: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      map(() => {
        this.refreshService.trigger();
        return;
      }),
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  private refreshService = inject(DataRefreshService);
  private api = 'http://localhost:3000/bankAccount';

  getAll(): Observable<bankAccount[]> {
    return this.http.get<bankAccount[]>(this.api);
  }

  add(user: bankAccount): Observable<bankAccount> {
    return this.http.post<bankAccount>(this.api, user).pipe(
      map((response) => {
        this.refreshService.trigger();
        return response;
      }),
    );
  }

  update(user: bankAccount): Observable<bankAccount> {
    return this.http.put<bankAccount>(`${this.api}/${user.id}`, user).pipe(
      map((response) => {
        this.refreshService.trigger();
        return response;
      }),
    );
  }

  delete(batchId?: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${batchId}`).pipe(
      map(() => {
        this.refreshService.trigger();
        return;
      }),
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class vanCreationService {
  private http = inject(HttpClient);
  private refreshService = inject(DataRefreshService);
  private api = 'http://localhost:3000/VANCreation';

  getAll(): Observable<CreateVANRequest[]> {
    return this.http.get<CreateVANRequest[]>(this.api);
  }

  getById(id: string): Observable<CreateVANRequest> {
    return this.http.get<CreateVANRequest>(`${this.api}/${id}`);
  }

  add(user: CreateVANRequest): Observable<CreateVANRequest> {
    return this.http.post<CreateVANRequest>(this.api, user).pipe(
      map((response) => {
        this.refreshService.trigger();
        return response;
      }),
    );
  }

  update(user: CreateVANRequest): Observable<CreateVANRequest> {
    return this.http.put<CreateVANRequest>(`${this.api}/${user.id}`, user).pipe(
      map((response) => {
        this.refreshService.trigger();
        return response;
      }),
    );
  }

  delete(id?: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      map(() => {
        this.refreshService.trigger();
        return;
      }),
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);
  private refreshService = inject(DataRefreshService);
  private api = 'http://localhost:3000/payments';

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  getByBatchId(batchId: string): Observable<any> {
    return this.http
      .get<any[]>(this.api, {
        params: {
          batchId: batchId,
        },
      })
      .pipe(map((payments) => payments[0] || null));
  }

  add(payment: any): Observable<any> {
    return this.http.post<any>(this.api, payment).pipe(
      map((response) => {
        this.refreshService.trigger();
        return response;
      }),
    );
  }

  update(payment: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${payment.id}`, payment).pipe(
      map((response) => {
        this.refreshService.trigger();
        return response;
      }),
    );
  }

  delete(id?: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      map(() => {
        this.refreshService.trigger();
        return;
      }),
    );
  }
}
