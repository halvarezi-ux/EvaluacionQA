import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';  // ← AGREGAR ESTA LÍNEA
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router  // ← AGREGAR ESTA LÍNEA
  ) {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

 onSubmit() {
  this.error = null;
  if (this.loginForm.invalid) return;
  
  this.loading = true;
  const { user, password } = this.loginForm.value;
  
  this.authService.login(user, password).subscribe({
    next: (res) => {
      this.loading = false;
      this.tokenService.setToken(res.access_token);
      this.tokenService.setUser(res.user);
      
      // Redirigir según rol del usuario
      this.redirectByRole(res.user.role);
    },
    error: err => {
      this.loading = false;
      this.error = err.error?.message || 'Error de autenticación';
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
}
