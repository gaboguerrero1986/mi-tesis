import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EventManagementComponent } from './event-management/event-management.component';
import { MetricBuilderComponent } from './metric-builder/metric-builder.component';
import { JuryManagementComponent } from './jury-management/jury-management.component';
import { ManagerManagementComponent } from './manager-management/manager-management.component';
import { ReportsDashboardComponent } from './reports-dashboard/reports-dashboard.component';
import { GlobalMetricsComponent } from './global-metrics/global-metrics.component';
import { EventResultsComponent } from './event-results/event-results.component';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ChartModule } from 'primeng/chart';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { PickListModule } from 'primeng/picklist';
import { BadgeModule } from 'primeng/badge';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    EventManagementComponent,
    MetricBuilderComponent,
    JuryManagementComponent,
    ManagerManagementComponent,
    ReportsDashboardComponent,
    GlobalMetricsComponent,
    EventResultsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminRoutingModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    TableModule,
    DialogModule,
    TabViewModule,
    InputNumberModule,
    RadioButtonModule,
    CheckboxModule,
    ChartModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule,
    PickListModule,
    BadgeModule
  ],
  providers: [ConfirmationService]
})
export class AdminModule { }