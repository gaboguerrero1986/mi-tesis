import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ManagerService, Manager } from '../../services/manager.service';

@Component({
  selector: 'app-manager-management',
  templateUrl: './manager-management.component.html',
  styleUrls: ['./manager-management.component.scss']
})
export class ManagerManagementComponent implements OnInit {
  managers: any[] = [];
  editingId: number | null = null;
  managerForm: FormGroup;
  displayManagerDialog = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private managerService: ManagerService,
    private confirmationService: ConfirmationService
  ) {
    this.managerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadManagers();
  }

  loadManagers(): void {
    this.managerService.getAll().subscribe(
      (list: Manager[]) => this.managers = list,
      () => this.managers = []
    );
  }

  showManagerDialog(manager?: Manager): void {
    this.displayManagerDialog = true;
    this.managerForm.reset();
    this.editingId = null;
    if (manager) {
      this.editingId = manager.id;
      this.managerForm.patchValue({
        name: manager.name || '',
        email: manager.email || ''
      });
    }
  }

  saveManager(): void {
    if (this.managerForm.valid) {
      const managerData = this.managerForm.value;
      const toCreate: Omit<Manager, 'id'> = {
        email: managerData.email,
        name: managerData.name,
        username: managerData.email
      };

      if (this.editingId) {
        const res = this.managerService.updateManager(this.editingId, toCreate as Partial<Manager>);
        if ((res as any).subscribe) {
          (res as any).subscribe(() => {
            this.loadManagers();
            this.displayManagerDialog = false;
            this.editingId = null;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gestor actualizado correctamente' });
          }, () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar gestor' }));
        } else {
          this.loadManagers();
          this.displayManagerDialog = false;
          this.editingId = null;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gestor actualizado correctamente' });
        }
      } else {
        const res = this.managerService.addManager(toCreate);
        if ((res as any).subscribe) {
          (res as any).subscribe(() => {
            this.loadManagers();
            this.displayManagerDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gestor registrado correctamente' });
          }, () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar gestor' }));
        } else {
          this.loadManagers();
          this.displayManagerDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gestor registrado correctamente' });
        }
      }
    }
  }

  removeManager(id: any): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro que deseas eliminar este gestor?',
      accept: () => {
        const res = this.managerService.removeManager(id);
        if ((res as any).subscribe) {
          (res as any).subscribe(() => {
            this.loadManagers();
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Gestor eliminado' });
          }, () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar gestor' }));
        } else {
          if (res) {
            this.loadManagers();
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Gestor eliminado' });
          } else {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Gestor no encontrado' });
          }
        }
      }
    });
  }

  resetPassword(id: any): void {
    this.confirmationService.confirm({
      message: '¿Resetear contraseña a "temporal123"?',
      header: 'Confirmar Reset',
      icon: 'pi pi-refresh',
      accept: () => {
        this.managerService.resetPassword(id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña reseteada' }),
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo resetear' })
        });
      }
    });
  }
}
