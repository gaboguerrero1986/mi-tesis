import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { AuthGuard } from '../auth/auth.guard';
import { EvaluationFormComponent } from './evaluation-form/evaluation-form.component';

const routes: Routes = [
  {
    path: '',
    component: StudentDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'student' }
  },
  {
    path: 'evaluate/:id',
    component: EvaluationFormComponent,
    canActivate: [AuthGuard],
    data: { role: 'student' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }