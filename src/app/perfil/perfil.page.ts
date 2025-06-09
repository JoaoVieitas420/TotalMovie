import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {
  nome: string = '';
  email: string = '';
  profilePhotoUrl: string = 'assets/img/default-profile.jpg';
  bio: string = '';
  localizacao: string = '';
  estiloPreferido: number[] = [];
  generos: any[] = [];
  favoritos: any[] = [];

  constructor(
    private router: Router,
    private storage: Storage,
    private movieService: MovieService
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.carregarGeneros();
    await this.carregarPerfil();
    await this.carregarFavoritos();
  }

  async ionViewWillEnter() {
    await this.carregarPerfil();
    await this.carregarFavoritos();
  }

  async carregarGeneros() {
    this.movieService.getGenres().subscribe((res: any) => {
      this.generos = res.genres || [];
    });
  }

  async carregarPerfil() {
    const sessionEmail = await this.storage.get('session');
    if (!sessionEmail) return;

    this.email = sessionEmail; // 👈 mostrar email mesmo que perfil esteja vazio

    const perfil = await this.storage.get(`perfil-${sessionEmail}`);
    if (perfil) {
      this.nome = perfil.nome || '';
      this.profilePhotoUrl = perfil.foto || 'assets/img/default-profile.jpg';
      this.bio = perfil.bio || '';
      this.localizacao = perfil.localizacao || '';
      this.estiloPreferido = Array.isArray(perfil.estiloPreferido)
        ? perfil.estiloPreferido
        : perfil.estiloPreferido
        ? [perfil.estiloPreferido]
        : [];
    }
  }

  async carregarFavoritos() {
    const listas = await this.storage.get('listas');
    const favoritos = listas?.find((l: any) => l.nome === 'Favoritos');
    this.favoritos = favoritos?.filmes || [];
  }

  getGeneroNome(id: number): string {
    const genero = this.generos.find(g => g.id === id);
    return genero ? genero.name : id.toString();
  }

  async logout() {
    await this.storage.remove('session');
    this.nome = '';
    this.email = '';
    this.bio = '';
    this.localizacao = '';
    this.estiloPreferido = [];
    this.profilePhotoUrl = 'assets/img/default-profile.jpg';
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  editarPerfil() {
    this.router.navigate(['/editar-perfil']);
  }

  navegarParaPesquisa() {
    this.router.navigate(['/tabs/search']);
  }
}