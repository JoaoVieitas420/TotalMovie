import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'listas',
        children: [
          {
            path: '',
            loadChildren: () => import('../listas/listas.module').then(m => m.ListasPageModule)
          },
          {
            path: 'criar',
            loadChildren: () => import('../listas/criar/criar.module').then(m => m.CriarPageModule)
          }
        ]
      },
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'search',
        loadChildren: () => import('../search/search.module').then(m => m.SearchPageModule)
      },
      {
        path: 'recomendacoes',
        loadChildren: () => import('../recomendacoes/recomendacoes.module').then(m => m.RecomendacoesPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/listas',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
