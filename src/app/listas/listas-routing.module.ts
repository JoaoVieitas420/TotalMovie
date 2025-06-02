import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListasPage } from './listas.page';

const routes: Routes = [
  {
    path: '',
    component: ListasPage
  },  {
    path: 'criar',
    loadChildren: () => import('./criar/criar.module').then( m => m.CriarPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListasPageRoutingModule {}
