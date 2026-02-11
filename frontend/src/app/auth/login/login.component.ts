import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    private tokenService: TokenService
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
        // Redirigir al dashboard o módulo según rol
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Error de autenticación';
      }
    });
  }
}
