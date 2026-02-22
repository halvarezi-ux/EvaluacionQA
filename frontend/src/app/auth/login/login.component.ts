import { Component, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        query('.animate-item', [
          style({
            opacity: 0,
            transform: 'translateY(20px)'
          }),
          stagger(80, [
            animate(
              '500ms cubic-bezier(0.16, 1, 0.3, 1)',
              style({
                opacity: 1,
                transform: 'translateY(0)'
              })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class LoginComponent {
  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  showSuccess = false;
  hidePassword = true;
  capsLockOn = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private renderer: Renderer2
  ) {
    // Cargar último usuario usado (DESACTIVADO)
    // const lastUser = localStorage.getItem(this.LAST_USER_KEY) || '';
    
    this.loginForm = this.fb.group({
      user: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]  // Por defecto: Session Storage (más seguro)
    });

    // Limpiar errores cuando el usuario empieza a escribir
    this.loginForm.valueChanges.subscribe(() => {
      if (this.error) {
        this.error = null;
      }
    });

    // Auto-focus a password cuando usuario tiene 4+ caracteres válidos (DESACTIVADO)
    // this.loginForm.get('user')?.valueChanges.pipe(
    //   filter(val => val && val.length >= 4 && !this.loginForm.get('user')?.errors)
    // ).subscribe(() => {
    //   if (this.passwordInput) {
    //     setTimeout(() => this.passwordInput.nativeElement.focus(), 50);
    //   }
    // });
  }

  // Auto-focus en primer input (DESACTIVADO)
  // ngAfterViewInit(): void {
  //   setTimeout(() => {
  //     if (!this.loginForm.get('user')?.value) {
  //       this.userInput.nativeElement.focus();
  //     } else {
  //       this.passwordInput.nativeElement.focus();
  //     }
  //   }, 350);
  // }

 onSubmit(): void {
  this.error = null;
  
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    this.error = 'Por favor completa todos los campos correctamente';
    return;
  }
  
  this.loading = true;
  const { user, password, rememberMe } = this.loginForm.value;
  
  // Guardar último usuario usado (DESACTIVADO)
  // localStorage.setItem(this.LAST_USER_KEY, user);
  
  this.authService.login(user, password).subscribe({
    next: (res) => {
      this.loading = false;
      this.showSuccess = true;
      
      // Guardar token y usuario según preferencia "Recordarme"
      this.tokenService.setToken(res.access_token, rememberMe);
      this.tokenService.setUser(res.user, rememberMe);
      
      // Success feedback antes de redirect (premium feel)
      setTimeout(() => {
        const roleName = res.user.role?.nombre || res.user.role;
        this.redirectByRole(roleName);
      }, 600);
    },
    error: (err: HttpErrorResponse) => {
      this.loading = false;
      
      if (err.status === 401) {
        this.error = 'Credenciales incorrectas';
      } else if (err.status === 0) {
        this.error = 'Error de conexión. Verifica tu red.';
      } else if (err.status === 500) {
        this.error = 'Error del servidor. Intenta más tarde.';
      } else {
        this.error = err.error?.message || 'Error de autenticación';
      }
    }
  });
}

/**
 * Redirige al usuario según su rol
 */
private redirectByRole(role: string): void {
  const roleRoutes: { [key: string]: string } = {
    'Admin': '/admin',
    'QA Lead': '/dashboard',  // QA Lead no tiene componente aún, va a dashboard
    'QA': '/qa',
    'Analista': '/analista',
    'Asesor': '/dashboard'     // Asesor no tiene componente aún, va a dashboard
  };

  const route = roleRoutes[role] || '/dashboard';
  this.router.navigate([route]);
}

/**
 * Detectar Caps Lock en password field
 */
onPasswordKeydown(event: KeyboardEvent): void {
  this.capsLockOn = event.getModifierState('CapsLock');
}

/**
 * Ripple effect optimizado con Renderer2 (evita manipulación directa del DOM)
 */
onButtonClick(event: MouseEvent): void {
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  const ripple = this.renderer.createElement('span');
  this.renderer.addClass(ripple, 'ripple');
  
  this.renderer.setStyle(ripple, 'width', `${size}px`);
  this.renderer.setStyle(ripple, 'height', `${size}px`);
  this.renderer.setStyle(ripple, 'left', `${event.clientX - rect.left}px`);
  this.renderer.setStyle(ripple, 'top', `${event.clientY - rect.top}px`);
  
  this.renderer.appendChild(button, ripple);

  setTimeout(() => {
    this.renderer.removeChild(button, ripple);
  }, 600);
}
}
