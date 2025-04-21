import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';

// platformBrowserDynamic().bootstrapModule(AppComponent);
bootstrapApplication(AppComponent,appConfig)
  .catch((err) => console.error(err));
