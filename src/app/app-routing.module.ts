import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ViewerPdfComponent } from './viewer-pdf/viewer-pdf.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'viewer', component: ViewerPdfComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
