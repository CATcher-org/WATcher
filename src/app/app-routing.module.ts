import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './core/guards/auth.guard';
import { IssuesViewerModule } from './issues-viewer/issues-viewer.module';

const routes: Routes = [
  { path: '', loadChildren: () => AuthModule },
  { path: 'issues-viewer', loadChildren: () => IssuesViewerModule, canLoad: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
