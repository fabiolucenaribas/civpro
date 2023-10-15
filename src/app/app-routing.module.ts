import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CaptacaoComponent } from './captacao/captacao.component';
import { ViewerPdfComponent } from './viewer-pdf/viewer-pdf.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'captacao', component: CaptacaoComponent },
  { path: 'viewer', component: ViewerPdfComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
