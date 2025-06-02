import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  { path: 'tabs', loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule) },

{
  path: 'movie/:id',
  loadChildren: () => import('./movie-detail/movie-detail.module').then(m => m.MovieDetailPageModule)
},
{
  path: 'listas/criar',
  loadChildren: () => import('./listas/criar/criar.module').then(m => m.CriarPageModule)
}

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
