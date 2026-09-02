import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { MyProvider } from './provider';
import { AppConfigService } from './app-config.service';
import { SHOW_LOADING_SPINNER } from './api-loading.service';
import { Observable } from 'rxjs/internal/Observable';

// Create a unique InjectionToken for host-provided HTTP service
export const DSS_HTTP_SERVICE = new InjectionToken<any>(
  'my-custom-lib.HOST_HTTP_SERVICE',
);

export interface DssHttpRequestOptions {
  headers?: HttpHeaders;
  isLoadingSpinner?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Http {
  status: boolean = false;
  baseUrl: string;
  config = inject(AppConfigService);
  http = inject(HttpClient);
  provider = inject(MyProvider);
  constructor() {
    this.baseUrl = this.config.apiServer;
  }

  private spinnerContext(isLoadingSpinner: boolean): HttpContext {
    return new HttpContext().set(SHOW_LOADING_SPINNER, isLoadingSpinner);
  }

  private resolveRequestOptions(
    options?: DssHttpRequestOptions | HttpHeaders | boolean,
    legacyIsLoadingSpinner = true,
  ): Required<Pick<DssHttpRequestOptions, 'isLoadingSpinner'>> &
    Pick<DssHttpRequestOptions, 'headers'> {
    if (typeof options === 'boolean') {
      return { isLoadingSpinner: options };
    }

    if (options instanceof HttpHeaders) {
      return { headers: options, isLoadingSpinner: legacyIsLoadingSpinner };
    }

    return {
      headers: options?.headers,
      isLoadingSpinner: options?.isLoadingSpinner ?? legacyIsLoadingSpinner,
    };
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
    const memoryToken = this.provider.companyInfo?.user?.access_token;
    const storedToken =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('token')
        : null;
    const token = memoryToken || storedToken;
    return token ? `Bearer ${token}` : '';
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

  get<T>(
    sub: string,
    param?: {},
    options?: DssHttpRequestOptions | HttpHeaders,
    legacyIsLoadingSpinner = true,
  ): Observable<T> {
    const url = this.baseUrl + sub;
    const requestOptions = this.resolveRequestOptions(
      options,
      legacyIsLoadingSpinner,
    );
    const headers = requestOptions.headers ?? this.getHeaders();
    return this.http.get<T>(url, {
      headers,
      params: param,
      context: this.spinnerContext(requestOptions.isLoadingSpinner),
    });
  }

  getDoc(sub: string, param?: {}, options?: DssHttpRequestOptions | boolean) {
    const url = this.baseUrl + sub;
    const requestOptions = this.resolveRequestOptions(options);
    const headers = requestOptions.headers ?? this.getHeaders();
    return this.http.get(url, {
      params: param,
      headers,
      responseType: 'arraybuffer',
      context: this.spinnerContext(requestOptions.isLoadingSpinner),
    });
  }

  put<T>(
    sub: string,
    data: any,
    param?: {},
    options?: DssHttpRequestOptions | HttpHeaders,
    legacyIsLoadingSpinner = true,
  ): Observable<T> {
    const url = this.baseUrl + sub;
    const requestOptions = this.resolveRequestOptions(
      options,
      legacyIsLoadingSpinner,
    );
    const headers = requestOptions.headers ?? this.getHeaders();

    return this.http.put<T>(url, this.cleanObject(data, 2), {
      headers,
      params: param,
      context: this.spinnerContext(requestOptions.isLoadingSpinner),
    });
  }

  post<T>(
    sub: string,
    data: any,
    params?: {} | undefined,
    options?: DssHttpRequestOptions | HttpHeaders,
    legacyIsLoadingSpinner = true,
  ): Observable<T> {
    const url = this.baseUrl + sub;
    const requestOptions = this.resolveRequestOptions(
      options,
      legacyIsLoadingSpinner,
    );
    let headers = requestOptions.headers;
    if (!headers)
      //   header = new HttpHeaders({
      //     Authorization: this.token(),
      //     'X-FY': this.dbName(),
      //     'X-FIRM-ID': this.firm(),
      //   });
      // header.set('Content-Type', 'application/json');
      headers = this.getHeaders();
    const cleanObjData = this.cleanObject(data, 2);

    return this.http.post<T>(url, cleanObjData, {
      headers,
      params,
      context: this.spinnerContext(requestOptions.isLoadingSpinner),
    });
  }

  attachDoc(
    sub: string,
    data: any,
    params?: {},
    options?: DssHttpRequestOptions | HttpHeaders,
    legacyIsLoadingSpinner = true,
  ) {
    const url = this.baseUrl + sub;
    const requestOptions = this.resolveRequestOptions(
      options,
      legacyIsLoadingSpinner,
    );
    const headers = requestOptions.headers ?? this.getHeaders('');

    return this.http.post<any>(url, data, {
      headers,
      params,
      context: this.spinnerContext(requestOptions.isLoadingSpinner),
    });
  }

  delete<T>(
    sub: string,
    param?: {} | undefined,
    options?: DssHttpRequestOptions | HttpHeaders,
    legacyIsLoadingSpinner = true,
  ): Observable<T> {
    const url = this.baseUrl + sub;
    const requestOptions = this.resolveRequestOptions(
      options,
      legacyIsLoadingSpinner,
    );
    const headers = requestOptions.headers ?? this.getHeaders();

    return this.http.delete<T>(url, {
      headers,
      params: param,
      context: this.spinnerContext(requestOptions.isLoadingSpinner),
    });
  }
}
