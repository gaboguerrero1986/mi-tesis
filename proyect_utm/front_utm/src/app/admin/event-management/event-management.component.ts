import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EventService } from '../../services/event.service';
import { Evento } from '../../shared/models/event.model';
import { Metrica } from '../../shared/models/metric.model';
import { Usuario } from '../../shared/models/user.model';
import { UserService } from '../../services/user.service';
import { EavService, ParametroEAV, EjecucionParametroEAV } from '../../services/eav.service';
import { MetricService } from '../../services/metric.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.scss']
})
export class EventManagementComponent implements OnInit {
  events: Evento[] = [];
  eventForm: FormGroup;
  displayEventDialog = false;
  isEditing = false;
  isReadOnly = false;
  editingEventId: string | null = null;

  // Jury Management
  allJurors: Usuario[] = [];
  sourceJurors: Usuario[] = [];
  targetJurors: Usuario[] = [];

  // Manager Management
  allManagers: Usuario[] = [];
  sourceManagers: Usuario[] = [];
  targetManagers: Usuario[] = [];
  isAdmin: boolean = false;

  // EAV Management
  eventoParams: ParametroEAV[] = [];
  participanteParams: ParametroEAV[] = [];
  displayEavDialog = false;
  newEavParam = { entity: 'Evento', description: '', dataType: 'string' };

  eventTypes = [
    { label: 'Académico', value: 'academic' },
    { label: 'Sociocultural', value: 'sociocultural' }
  ];

  // Solo métricas cuantitativas para jurados
  metricTypes = [
    { label: 'Cuantitativa (Numérica)', value: 'quantitative' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private eventService: EventService,
    private userService: UserService,
    private eavService: EavService,
    private metricService: MetricService,
    private authService: AuthService
  ) {
    this.eventForm = this.createEventForm();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = (user as any)?.role === 'admin';
    });
    this.loadEvents();
    this.loadJurors();
    this.loadManagers();
    this.loadEavParams();
  }

  loadEavParams(): void {
    this.eavService.getParameters('Evento').subscribe(res => {
      this.eventoParams = res;
      // Add form controls for EAV dynamically
      res.forEach(param => {
        if (!this.eventForm.contains(`eav_${param.id}`)) {
          this.eventForm.addControl(`eav_${param.id}`, this.fb.control(''));
        }
      });
    });
    this.eavService.getParameters('Inscripcion').subscribe(res => this.participanteParams = res);
  }

  showEavCreationDialog(): void {
    this.newEavParam = { entity: 'Evento', description: '', dataType: 'string' };
    this.displayEavDialog = true;
  }

  saveEavParam(): void {
    if (!this.newEavParam.description) return;
    this.eavService.createParameter(this.newEavParam.entity, this.newEavParam.description, this.newEavParam.dataType).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Nuevo campo dinámico guardado' });
        this.loadEavParams();
        this.newEavParam.description = ''; // Reset only description so they can create more easily
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el campo' })
    });
  }

  toggleEavParam(param: ParametroEAV): void {
    const actionStr = param.is_active ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Estás seguro de ${actionStr} el campo dinámico "${param.descripcion}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eavService.toggleParameter(param.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Campo ${param.is_active ? 'desactivado' : 'activado'}` });
            this.loadEavParams();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado del campo' })
        });
      }
    });
  }

  loadJurors(): void {
    this.userService.getUsersByRole('jury').subscribe({
      next: (users) => {
        this.allJurors = users;
      },
      error: (err) => console.error('Error loading jurors', err)
    });
  }

  loadManagers(): void {
    this.userService.getUsersByRole('manager').subscribe({
      next: (users) => {
        this.allManagers = users;
      },
      error: (err) => console.error('Error loading managers', err)
    });
  }

  createEventForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: ['', Validators.required],
      endDate: [''],
      evalMode: ['individual', Validators.required],
      isPublic: [true], // Default to public as per requirements
      participants: this.fb.array([]),
      metrics: this.fb.array([])
    });
  }

  get metricsFormArray(): FormArray {
    return this.eventForm.get('metrics') as FormArray;
  }

  get participantsFormArray(): FormArray {
    return this.eventForm.get('participants') as FormArray;
  }

  addMetric(): void {
    const metricGroup = this.fb.group({
      name: ['', Validators.required],
      type: ['quantitative', Validators.required],
      targetRole: ['jury', Validators.required],
      minVal: [1],
      maxVal: [5]
    });
    this.metricsFormArray.push(metricGroup);
  }

  removeMetric(index: number): void {
    this.metricsFormArray.removeAt(index);
  }

  addParticipant(): void {
    const isGroup = this.eventForm.get('evalMode')?.value === 'group';
    const participantGroup = this.fb.group({
      id: [''],
      name: [isGroup ? '' : 'Individual Participant', Validators.required],
      description: [''],
      order: [this.participantsFormArray.length],
      integrantes: this.fb.array([])
    });

    this.participantsFormArray.push(participantGroup);
    // Auto-add one integrante
    this.addIntegrante(this.participantsFormArray.length - 1);
  }

  getIntegrantesFormArray(participantIndex: number): FormArray {
    return this.participantsFormArray.at(participantIndex).get('integrantes') as FormArray;
  }

  addIntegrante(participantIndex: number, data?: any): void {
    const integrantesArray = this.getIntegrantesFormArray(participantIndex);
    const integranteGroup = this.fb.group({
      id: [data?.id || ''],
      persona_id: [data?.persona?.id || ''],
      nombres: [data?.persona?.nombres || '', Validators.required],
      apellidos: [data?.persona?.apellidos || '']
    });
    
    this.participanteParams.forEach(param => {
      (integranteGroup as any).addControl(`eav_${param.id}`, this.fb.control(''));
    });

    integrantesArray.push(integranteGroup);
  }

  removeIntegrante(participantIndex: number, integranteIndex: number): void {
    this.getIntegrantesFormArray(participantIndex).removeAt(integranteIndex);
  }

  removeParticipant(index: number): void {
    this.participantsFormArray.removeAt(index);
  }

  loadEvents(): void {
    this.authService.currentUser$.subscribe(user => {
      const role = (user as any)?.role;
      this.eventService.getEvents(role).subscribe({
        next: (events) => {
          this.events = events;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar eventos' });
          console.error(err);
        }
      });
    });
  }

  showEventDialog(event?: Evento): void {
    this.displayEventDialog = true;
    this.metricsFormArray.clear();
    this.participantsFormArray.clear();

    if (event) {
      // Modo edición
      this.isEditing = true;
      this.editingEventId = event.id;

      this.eventForm.patchValue({
        title: event.titulo,
        description: event.descripcion || '',
        startDate: this.formatDateTimeForInput(event.fecha_inicio),
        endDate: this.formatDateTimeForInput(event.fecha_fin),
        evalMode: event.modalidad_evaluacion || 'individual',
        isPublic: true // Force public for now, or event.isPublic || true
      });
      
      // Setup Managers PickList
      if (event.responsable_id) {
        this.targetManagers = this.allManagers.filter(m => m.id === event.responsable_id);
        this.sourceManagers = this.allManagers.filter(m => m.id !== event.responsable_id);
      } else {
        this.targetManagers = [];
        this.sourceManagers = [...this.allManagers];
      }

      if (event.metricas) {
        event.metricas.forEach((m: any) => {
          const metricGroup = this.fb.group({
            id: [m.id],
            name: [m.nombre, Validators.required],
            type: ['quantitative', Validators.required],
            targetRole: [m.rol_evaluador || 'jury', Validators.required],
            minVal: [1],
            maxVal: [5]
          });
          this.metricsFormArray.push(metricGroup);
        });
      }

      if (event.inscripciones) {
        event.inscripciones.forEach((p: any, idx: number) => {
          const participantGroup = this.fb.group({
            id: [p.id],
            name: [p.nombre_equipo || 'Individual Participant', Validators.required],
            description: [p.descripcion || ''],
            order: [this.participantsFormArray.length],
            integrantes: this.fb.array([])
          });

          this.participantsFormArray.push(participantGroup);

          if (p.integrantes && p.integrantes.length > 0) {
            p.integrantes.forEach((int: any) => {
              this.addIntegrante(idx, int);
              
              // Cargar valores EAV para este integrante
              const intFormArray = this.getIntegrantesFormArray(idx);
              const intGroup = intFormArray.controls[intFormArray.length - 1];
              
              if (int.persona && int.persona.id) {
                this.eavService.getValues(int.persona.id).subscribe((valores: EjecucionParametroEAV[]) => {
                  valores.forEach(v => {
                    const control = intGroup.get(`eav_${v.parametro_id}`);
                    if (control) {
                      control.setValue(v.valor_texto || v.valor_numerico || '');
                    }
                  });
                });
              }
            });
          } else {
             // Si no hay integrantes, añadimos uno vacío
             this.addIntegrante(idx);
          }
        });
      }

      // Initialize Jury Picklist
      if (event.jurados) {
        this.targetJurors = event.jurados.map((j: any) => {
          if (j.usuario) j.usuario._jurado_evento_id = j.id;
          return j.usuario;
        }).filter(u => u != null) as any;
        this.sourceJurors = this.allJurors.filter(u => !this.targetJurors.find(t => t.id === u.id));
      } else {
        this.targetJurors = [];
        this.sourceJurors = [...this.allJurors];
      }

      if (event.estado === 'completado') {
        this.isReadOnly = true;
        this.eventForm.disable();
      } else {
        this.isReadOnly = false;
        this.eventForm.enable();
      }
    } else {
      // Modo creación
      this.isEditing = false;
      this.isReadOnly = false;
      this.editingEventId = null;
      this.targetManagers = [];
      this.sourceManagers = [...this.allManagers];
      this.eventForm.reset({});
      this.eventForm.enable();
      this.metricsFormArray.clear();
      this.participantsFormArray.clear();

      this.targetJurors = [];
      this.sourceJurors = [...this.allJurors];

      // Pre-populate with Global Metrics
      this.metricService.getGlobalMetrics().subscribe({
        next: (globals) => {
          if (globals && globals.length > 0) {
            globals.forEach(g => {
              const metricGroup = this.fb.group({
                id: [''],
                name: [g.nombre, Validators.required],
                type: ['quantitative', Validators.required],
                targetRole: [g.rol_evaluador || 'jury', Validators.required],
                minVal: [1],
                maxVal: [5]
              });
              this.metricsFormArray.push(metricGroup);
            });
          }
        },
        error: (err) => {
          console.error('Error fetching global metrics:', err);
        }
      });
    }
  }

  private formatDateTimeForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const hours = ('0' + d.getHours()).slice(-2);
    const minutes = ('0' + d.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  saveEvent(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;

      const backendData: any = {
        titulo: formValue.title,
        descripcion: formValue.description,
        fecha_inicio: formValue.startDate ? new Date(formValue.startDate) : null,
        fecha_fin: formValue.endDate ? new Date(formValue.endDate) : null,
        estado: 'publicado',
        modalidad_evaluacion: formValue.evalMode,
        responsable_id: this.targetManagers.length > 0 ? this.targetManagers[0].id : null,
        metricas: formValue.metrics.map((m: any) => {
          const res: any = { nombre: m.name, peso_porcentual: 100, rol_evaluador: m.targetRole };
          if (m.id) res.id = m.id;
          return res;
        }),
        inscripciones: formValue.participants.map((p: any) => {
          // Si es individual y no puso nombre de equipo, le ponemos el nombre del integrante
          const firstIntegranteName = p.integrantes?.length > 0 ? `${p.integrantes[0].nombres} ${p.integrantes[0].apellidos}`.trim() : 'Participante Individual';
          const isGroup = formValue.evalMode === 'group';
          
          const res: any = { 
            nombre_equipo: isGroup ? p.name : firstIntegranteName, 
            descripcion: p.description, 
            tipo_inscripcion: isGroup ? 'grupo' : 'individual',
            integrantes: p.integrantes.map((int: any) => {
              const rel: any = {
                persona: {
                  nombres: int.nombres,
                  apellidos: int.apellidos
                }
              };
              if (int.persona_id) rel.persona.id = int.persona_id;
              if (int.id) rel.id = int.id;
              return rel;
            })
          };
          if (p.id) res.id = p.id;
          return res;
        }),
        jurados: this.targetJurors.map((j: any) => {
          const relation: any = { usuario_id: j.id };
          if (j._jurado_evento_id) relation.id = j._jurado_evento_id;
          return relation;
        })
      };

      if (this.isEditing && this.editingEventId) {
        this.eventService.updateEvent(this.editingEventId, backendData).subscribe({
          next: (res: any) => {
            this.saveEavValues(this.editingEventId as string, res?.inscripciones);
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento actualizado' });
            this.displayEventDialog = false;
            this.loadEvents();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
        });
      } else {
        this.eventService.createEvent(backendData).subscribe({
          next: (res: any) => {
            // Check if response has the new Event ID to save EAV
            if (res && res.id) {
               this.saveEavValues(res.id, res.inscripciones);
            }
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento creado' });
            this.displayEventDialog = false;
            this.loadEvents();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
        });
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos requeridos' });
    }
  }

  saveEavValues(eventId: string, inscripciones?: any[]): void {
    // 1. Save Event EAVs
    const eavBatch: any[] = [];
    this.eventoParams.forEach(param => {
      const val = this.eventForm.get(`eav_${param.id}`)?.value;
      if (val) {
        eavBatch.push({ parameterId: param.id, value: val });
      }
    });

    if (eavBatch.length > 0) {
      this.eavService.saveBatchValues(eventId, eavBatch).subscribe();
    }

    // 2. Save Participant EAVs if they are returned by the backend
    if (inscripciones && inscripciones.length > 0) {
      const participantControls = this.participantsFormArray.controls;
      
      participantControls.forEach((control, idx) => {
        const integrantesFormArray = control.get('integrantes') as FormArray;
        const matchingBackendParticipant = inscripciones[idx]; // Assuming order is maintained
        
        if (matchingBackendParticipant && matchingBackendParticipant.integrantes) {
          integrantesFormArray.controls.forEach((intControl, intIdx) => {
            const matchingBackendIntegrante = matchingBackendParticipant.integrantes[intIdx];
            if (matchingBackendIntegrante && matchingBackendIntegrante.persona) {
              const participantEavBatch: any[] = [];
              this.participanteParams.forEach(param => {
                const val = intControl.get(`eav_${param.id}`)?.value;
                if (val) {
                  participantEavBatch.push({ parameterId: param.id, value: val });
                }
              });

              if (participantEavBatch.length > 0) {
                // Save EAV using the PERSONA ID!
                this.eavService.saveBatchValues(matchingBackendIntegrante.persona.id, participantEavBatch).subscribe();
              }
            }
          });
        }
      });
    }
  }

  deleteEvent(eventId: string): void {
    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento eliminado' });
        this.loadEvents();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
    });
  }

  finalizeEvent(event: Evento): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de finalizar el evento "${event.titulo}"? Esto cerrará las votaciones y publicará los resultados.`,
      header: 'Confirmar Finalización',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventService.updateEvent(event.id, { estado: 'completado' } as any).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento finalizado' });
            this.loadEvents();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo finalizar' })
        });
      }
    });
  }

  viewResults(eventId: string): void {
    this.router.navigate(['/admin/events', eventId, 'results']);
  }

  cancelEvent(): void {
    this.displayEventDialog = false;
  }

  onManagerMoveToTarget(event: any): void {
    if (this.targetManagers.length > 1) {
      // Keep only the most recently added manager (the last one)
      const keptManager = this.targetManagers[this.targetManagers.length - 1];
      const returnedManagers = this.targetManagers.slice(0, this.targetManagers.length - 1);
      
      this.targetManagers = [keptManager];
      this.sourceManagers = [...this.sourceManagers, ...returnedManagers];
      
      this.messageService.add({
        severity: 'info',
        summary: 'Aviso',
        detail: 'Solo se puede asignar un (1) responsable por evento. El anterior ha sido devuelto a la lista.'
      });
    }
  }

  // Helpers
  getEventTypeLabel(type: string): string { return 'Evento'; }
  getStatusBadgeClass(status: string): string { return 'status-active'; }
  getStatusLabel(status: string): string { return status; }
}