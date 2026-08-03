import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { userMgt } from '@shared-interfaces/settings/user';
import { configuration } from '@shared-interfaces/settings/configuration';
import { CreateVANRequest } from '@shared-interfaces/settings/van-creation';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/users';

  getAll(): Observable<userMgt[]> {
    return this.http.get<userMgt[]>(this.api);
  }

  add(user: userMgt): Observable<userMgt> {
    return this.http.post<userMgt>(this.api, user);
  }

  update(user: userMgt): Observable<userMgt> {
    return this.http.put<userMgt>(`${this.api}/${user.id}`, user);
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
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/configuration';

  getAll(): Observable<configuration[]> {
    return this.http.get<configuration[]>(this.api);
  }

  add(user: configuration): Observable<configuration> {
    return this.http.post<configuration>(this.api, user);
  }

  update(user: configuration): Observable<configuration> {
    return this.http.put<configuration>(`${this.api}/${user.id}`, user);
  }

  delete(batchId?: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${batchId}`);
  }
}

@Injectable({
  providedIn: 'root',
})
export class vanCreationService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/VANCreation';

  getAll(): Observable<CreateVANRequest[]> {
    return this.http.get<CreateVANRequest[]>(this.api);
  }

  getById(id: string): Observable<CreateVANRequest> {
    return this.http.get<CreateVANRequest>(`${this.api}/${id}`);
  }

  add(user: CreateVANRequest): Observable<CreateVANRequest> {
    return this.http.post<CreateVANRequest>(this.api, user);
  }

  update(user: CreateVANRequest): Observable<CreateVANRequest> {
    return this.http.put<CreateVANRequest>(`${this.api}/${user.id}`, user);
  }

  delete(id?: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
