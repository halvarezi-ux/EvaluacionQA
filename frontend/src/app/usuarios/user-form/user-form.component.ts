import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Role, CreateUserDto, UpdateUserDto } from '../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  roles: Role[] = [];
  isEditMode = false;
  userId: number | null = null;
  isLoading = false;
  isSaving = false;
  showPasswordFields = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    this.checkEditMode();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      user: ['', [
        Validators.required, 
        Validators.minLength(4),
        Validators.maxLength(50),
        Validators.pattern(/^[a-z0-9._]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
      role_id: ['', [Validators.required]],
      active: [true]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmation = control.get('password_confirmation');

    if (!password || !confirmation) {
      return null;
    }

    if (password.value !== confirmation.value) {
      confirmation.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Carga la lista de roles desde el backend
   */
  private loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        console.log('Roles recibidos:', roles);
        // Asegurar que roles sea siempre un array
        this.roles = Array.isArray(roles) ? roles : [];
        console.log('Roles asignados:', this.roles);
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.notificationService.showError('Error al cargar los roles');
        this.roles = []; // Inicializar como array vacío en caso de error
      }
    });
  }

  /**
   * Verifica si estamos en modo edición
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode = true;
      this.userId = parseInt(id, 10);
      this.showPasswordFields = false;
      
      // En modo edición, las contraseñas son opcionales
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password_confirmation')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('password_confirmation')?.updateValueAndValidity();
      
      this.loadUserData();
    }
  }

  /**
   * Carga los datos del usuario en modo edición
   */
  private loadUserData(): void {
    if (!this.userId) return;

    this.isLoading = true;
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          user: user.user,
          email: user.email,
          role_id: user.role_id,
          active: user.active
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.notificationService.showError('Error al cargar los datos del usuario');
        this.isLoading = false;
        this.router.navigate(['/admin/usuarios']);
      }
    });
  }

  /**
   * Alterna la visibilidad de los campos de contraseña en modo edición
   */
  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    
    if (this.showPasswordFields) {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password_confirmation')?.setValidators([Validators.required]);
    } else {
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password_confirmation')?.clearValidators();
      this.userForm.patchValue({ password: '', password_confirmation: '' });
    }
    
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('password_confirmation')?.updateValueAndValidity();
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.notificationService.showError('Por favor, corrija los errores en el formulario');
      return;
    }

    this.isSaving = true;

    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  /**
   * Crea un nuevo usuario
   */
  private createUser(): void {
    const userData: CreateUserDto = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Usuario creado exitosamente');
        this.router.navigate(['/admin/usuarios']);
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.handleFormErrors(error);
        this.isSaving = false;
      }
    });
  }

  /**
   * Actualiza un usuario existente
   */
  private updateUser(): void {
    if (!this.userId) return;

    const formValue = this.userForm.value;
    const userData: UpdateUserDto = {
      name: formValue.name,
      user: formValue.user,
      email: formValue.email,
      role_id: formValue.role_id,
      active: formValue.active
    };

    // Solo incluir password si se está cambiando
    if (this.showPasswordFields && formValue.password) {
      userData.password = formValue.password;
      userData.password_confirmation = formValue.password_confirmation;
    }

    this.userService.updateUser(this.userId, userData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Usuario actualizado exitosamente');
        this.router.navigate(['/admin/usuarios']);
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.handleFormErrors(error);
        this.isSaving = false;
      }
    });
  }

  /**
   * Maneja los errores de validación del backend
   */
  private handleFormErrors(error: any): void {
    if (error.status === 422 && error.error?.errors) {
      // Errores de validación de Laravel
      const errors = error.error.errors;
      Object.keys(errors).forEach(key => {
        const control = this.userForm.get(key);
        if (control) {
          control.setErrors({ serverError: errors[key][0] });
        }
      });
      this.notificationService.showError('Por favor, corrija los errores en el formulario');
    } else {
      this.notificationService.showError(
        error.error?.message || 'Error al guardar el usuario'
      );
    }
  }

  /**
   * Cancela y vuelve a la lista
   */
  onCancel(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }

    if (control.errors['email']) {
      return 'Ingrese un email válido';
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    if (control.errors['pattern']) {
      return 'Solo se permiten letras minúsculas, números, punto (.) y guión bajo (_)';
    }

    if (control.errors['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    return 'Campo inválido';
  }
}
