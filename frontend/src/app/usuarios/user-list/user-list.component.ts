import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'user', 'name', 'email', 'role', 'active', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Asignar paginator y sort después de que la vista esté inicializada
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Configurar accessor personalizado para ordenamiento de propiedades anidadas
    this.dataSource.sortingDataAccessor = (item: User, property: string) => {
      switch(property) {
        case 'role': return item.role?.nombre?.toLowerCase() || '';
        default: return (item as any)[property];
      }
    };
  }

  /**
   * Carga la lista de usuarios desde el backend
   */
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notificationService.showError(
          error.error?.message || 'Error al cargar los usuarios'
        );
        this.isLoading = false;
      }
    });
  }

  /**
   * Aplica filtro a la tabla
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Navega al formulario de creación
   */
  createUser(): void {
    this.router.navigate(['/admin/usuarios/new']);
  }

  /**
   * Navega al formulario de edición
   */
  editUser(user: User): void {
    this.router.navigate(['/admin/usuarios/edit', user.id]);
  }

  /**
   * Elimina un usuario con confirmación
   */
  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Está seguro de eliminar al usuario "${user.name}" (${user.user})?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Usuario eliminado exitosamente');
            this.loadUsers(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            this.notificationService.showError(
              error.error?.message || 'No se pudo eliminar el usuario'
            );
          }
        });
      }
    });
  }
}
