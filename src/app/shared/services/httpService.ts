import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, InjectionToken } from '@angular/core';
import { MyProvider } from './provider';
import { environment } from './../../../environments/environment';
import { SHOW_LOADING_SPINNER } from './api-loading.service';

// Create a unique InjectionToken for host-provided HTTP service
export const DSS_HTTP_SERVICE = new InjectionToken<any>(
  'my-custom-lib.HOST_HTTP_SERVICE',
);

@Injectable({
  providedIn: 'root',
})
export class Http {
  status: boolean = false;
  baseUrl: string;

  constructor(
    public http: HttpClient,
    public provider: MyProvider,
  ) {
    this.baseUrl = environment.apiServer;
  }

  private spinnerContext(isLoadingSpinner: boolean): HttpContext {
    return new HttpContext().set(SHOW_LOADING_SPINNER, isLoadingSpinner);
  }

  private getHeaders(contentType?: string | null): HttpHeaders {
    let customHeaders: any = {
      Authorization: this.token(),
    };

    if (contentType === undefined) {
      customHeaders['Content-Type'] = 'application/json';
    } else if (contentType) {
      customHeaders['Content-Type'] = contentType;
    }

    return new HttpHeaders(customHeaders);
  }

  token() {
    return this.provider.companyInfo?.user?.access_token
      ? `Bearer ${this.provider.companyInfo?.user.access_token}`
      : ``;
  }
  //   dbName() {
  //     return this.provider.companyInfo?.finYear?.divId || '';
  //   }
  //   firm() {
  //     return this.provider.companyInfo?.company?.firmCode || '';
  //   }
  cleanObject = (obj: any, level: number): any => {
    const isObject = (value: any) =>
      value instanceof Object && value.constructor.name === 'Object';
    const isEmptyObject = (value: any) =>
      isObject(value) && Object.values(value).length === 0;

    if (Array.isArray(obj)) {
      return obj
        .map((item) => this.cleanObject(item, level))
        .filter(
          (item) => item !== null && item !== undefined && !isEmptyObject(item),
        );
    }

    if (!isObject(obj) || level < 0) return obj;

    for (const key of Object.keys(obj)) {
      if (key.startsWith('__')) {
        delete obj[key];
        continue;
      }

      const value = obj[key];

      if (value === null || value === undefined) {
        delete obj[key];
        continue;
      }

      if (Array.isArray(value)) {
        obj[key] = this.cleanObject(value, level);
      } else if (isObject(value)) {
        obj[key] = this.cleanObject(value, level - 1);

        if (isEmptyObject(obj[key])) {
          delete obj[key];
        }
      }
    }

    return obj;
  };

  readJson<T>(url: string) {
    return this.http.get<T>(url);
  }

  get(sub: string, param?: {}, header?: HttpHeaders, isLoadingSpinner = true) {
    const url = this.baseUrl + sub;
    if (!header) {
      header = this.getHeaders();
    }
    return this.http.get<any>(url, {
      headers: header,
      params: param,
      context: this.spinnerContext(isLoadingSpinner),
    });
  }

  getDoc(sub: string, param?: {}, isLoadingSpinner = true) {
    const url = this.baseUrl + sub;
    const header = this.getHeaders();
    return this.http.get(url, {
      params: param,
      headers: header,
      responseType: 'arraybuffer',
      context: this.spinnerContext(isLoadingSpinner),
    });
  }

  put(
    sub: string,
    data: any,
    param?: {},
    header?: HttpHeaders,
    isLoadingSpinner = true,
  ) {
    const url = this.baseUrl + sub;
    if (!header) header = this.getHeaders();

    return this.http.put<any>(url, this.cleanObject(data, 2), {
      headers: header,
      params: param,
      context: this.spinnerContext(isLoadingSpinner),
    });
  }

  post(
    sub: string,
    data: any,
    params?: {},
    header?: HttpHeaders,
    isLoadingSpinner = true,
  ) {
    const url = this.baseUrl + sub;
    if (!header) header = this.getHeaders();
    const cleanObjData = this.cleanObject(data, 2);

    return this.http.post<any>(url, cleanObjData, {
      headers: header,
      params: params,
      context: this.spinnerContext(isLoadingSpinner),
    });
  }

  attachDoc(
    sub: string,
    data: any,
    params?: {},
    header?: HttpHeaders,
    isLoadingSpinner = true,
  ) {
    const url = this.baseUrl + sub;
    if (!header) header = this.getHeaders('');

    return this.http.post<any>(url, data, {
      headers: header,
      params: params,
      context: this.spinnerContext(isLoadingSpinner),
    });
  }

  delete(
    sub: string,
    param: {},
    header?: HttpHeaders,
    isLoadingSpinner = true,
  ) {
    const url = this.baseUrl + sub;
    if (!header) header = this.getHeaders();

    return this.http.delete<any>(url, {
      headers: header,
      params: param,
      context: this.spinnerContext(isLoadingSpinner),
    });
  }
}
