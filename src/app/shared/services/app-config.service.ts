import { Injectable } from '@angular/core';

export interface AppRuntimeConfig {
  apiServer: string;
  reportServer: string;


}

const fallbackConfig: AppRuntimeConfig = {
  apiServer: 'http://localhost:5184/',
  reportServer: 'http://localhost:54119/',


};

let runtimeConfig: AppRuntimeConfig = { ...fallbackConfig };

export async function loadAppConfig(): Promise<void> {
  try {
    const configUrl = new URL('assets/app-config.json', document.baseURI);
    const response = await fetch(configUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    runtimeConfig = { ...fallbackConfig, ...(await response.json()) };
  } catch (error) {
    console.warn('Unable to load app-config.json; using fallback configuration.', error);
  }
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  get apiServer(): string { return runtimeConfig.apiServer; }
  get reportServer(): string { return runtimeConfig.reportServer; }

}
