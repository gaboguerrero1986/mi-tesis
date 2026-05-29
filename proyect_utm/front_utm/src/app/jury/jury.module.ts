import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { JuryRoutingModule } from './jury-routing.module';
import { JuryDashboardComponent } from './jury-dashboard/jury-dashboard.component';
import { JuryEvaluationComponent } from './jury-evaluation/jury-evaluation.component';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    JuryDashboardComponent,
    JuryEvaluationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    JuryRoutingModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    SliderModule,
    RatingModule,
    InputTextareaModule,
    InputTextModule
  ],
  providers: [ConfirmationService]
})
export class JuryModule { }