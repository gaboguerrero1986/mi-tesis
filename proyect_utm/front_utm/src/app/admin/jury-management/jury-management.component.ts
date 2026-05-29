import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { JurorService, Juror } from '../../services/juror.service';

@Component({
  selector: 'app-jury-management',
  templateUrl: './jury-management.component.html',
  styleUrls: ['./jury-management.component.scss']
})
export class JuryManagementComponent implements OnInit {
  jurors: any[] = [];
  editingId: number | null = null;
  juryForm: FormGroup;
  displayJuryDialog = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private jurorService: JurorService,
    private confirmationService: ConfirmationService
  ) {
    this.juryForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadJurors();
  }

  loadJurors(): void {
    this.jurorService.getAll().subscribe(
      (list: Juror[]) => this.jurors = list,
      () => this.jurors = []
    );
  }

  showJuryDialog(juror?: Juror): void {
    this.displayJuryDialog = true;
    this.juryForm.reset();
    this.editingId = null;
    if (juror) {
      this.editingId = juror.id;
      this.juryForm.patchValue({
        name: juror.name || '',
        email: juror.email || ''
      });
    }
  }

  saveJury(): void {
    if (this.juryForm.valid) {
      const juryData = this.juryForm.value;
      const toCreate: Omit<Juror, 'id'> = {
        email: juryData.email,
        name: juryData.name,
        username: juryData.email // Use email as username
      };

      if (this.editingId) {
        const res = this.jurorService.updateJuror(this.editingId, toCreate as Partial<Juror>);
        if ((res as any).subscribe) {
          (res as any).subscribe(() => {
            this.loadJurors();
            this.displayJuryDialog = false;
            this.editingId = null;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Jurado actualizado correctamente' });
          }, () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar jurado' }));
        } else {
          this.loadJurors();
          this.displayJuryDialog = false;
          this.editingId = null;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Jurado actualizado correctamente' });
        }
      } else {
        const res = this.jurorService.addJuror(toCreate);
        if ((res as any).subscribe) {
          (res as any).subscribe(() => {
            this.loadJurors();
            this.displayJuryDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Jurado registrado correctamente' });
          }, () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar jurado' }));
        } else {
          this.loadJurors();
          this.displayJuryDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Jurado registrado correctamente' });
        }
      }
    }
  }

  removeJury(id: any): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro que deseas eliminar este jurado?',
      accept: () => {
        const res = this.jurorService.removeJuror(id);
        if ((res as any).subscribe) {
          (res as any).subscribe(() => {
            this.loadJurors();
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Jurado eliminado' });
          }, () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar jurado' }));
        } else {
          if (res) {
            this.loadJurors();
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Jurado eliminado' });
          } else {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Jurado no encontrado' });
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
        this.jurorService.resetPassword(id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña reseteada' }),
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo resetear' })
        });
      }
    });
  }
}