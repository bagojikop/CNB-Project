/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { loadAppConfig } from './app/shared/services/app-config.service';


loadAppConfig()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));

