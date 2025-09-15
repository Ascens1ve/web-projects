import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: "https://7fcbfba6c9d585610adea0ca4ebc158b@o4509979468890112.ingest.us.sentry.io/4509979475247104",
  environment: 'development',
  debug: true,
  sendDefaultPii: true
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
