import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
  BrowserModule,
  ReactiveFormsModule,
  HttpClientModule,
  RouterModule.forRoot(routes),
  MatInputModule,
  MatButtonModule,
  MatFormFieldModule,
  MatCardModule,
  MatIconModule,
  MatProgressSpinnerModule
],
  
  bootstrap: [AppComponent],
  providers: [
    provideAnimationsAsync()
  ]

  
})
export class AppModule { }