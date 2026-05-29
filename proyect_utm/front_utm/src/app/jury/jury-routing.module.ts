import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JuryDashboardComponent } from './jury-dashboard/jury-dashboard.component';
import { JuryEvaluationComponent } from './jury-evaluation/jury-evaluation.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: JuryDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'jury' }
  },
  {
    path: 'evaluate/:id',
    component: JuryEvaluationComponent,
    canActivate: [AuthGuard],
    data: { role: 'jury' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JuryRoutingModule { }