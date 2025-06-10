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
  nome: string = '';                          // Nome do utilizador
  email: string = '';                         // Email do utilizador
  profilePhotoUrl: string = 'assets/img/default-profile.jpg'; // Foto de perfil (ou padrão)
  bio: string = '';                           // Biografia do utilizador
  localizacao: string = '';                   // Localização do utilizador
  estiloPreferido: number[] = [];             // IDs dos géneros preferidos
  generos: any[] = [];                        // Lista de géneros disponíveis (id e nome)
  favoritos: any[] = [];                      // Filmes da lista "Favoritos"

  constructor(
    private router: Router,
    private storage: Storage,
    private movieService: MovieService
  ) {}

  // Ao iniciar, carrega géneros, perfil e favoritos
  async ngOnInit() {
    await this.storage.create();
    await this.carregarGeneros();
    await this.carregarPerfil();
    await this.carregarFavoritos();
  }

  // Sempre que entra na página, atualiza perfil e favoritos
  async ionViewWillEnter() {
    await this.carregarPerfil();
    await this.carregarFavoritos();
  }

  // Carrega a lista de géneros disponíveis do MovieService
  async carregarGeneros() {
    this.movieService.getGenres().subscribe((res: any) => {
      this.generos = res.genres || [];
    });
  }

  // Carrega os dados do perfil do utilizador autenticado
  async carregarPerfil() {
    const sessionEmail = await this.storage.get('session');
    if (!sessionEmail) return;

    this.email = sessionEmail; // Mostra sempre o email

    const perfil = await this.storage.get(`perfil-${sessionEmail}`);
    if (perfil) {
      this.nome = perfil.nome || '';
      this.profilePhotoUrl = perfil.foto || 'assets/img/default-profile.jpg';
      this.bio = perfil.bio || '';
      this.localizacao = perfil.localizacao || '';
      // Garante que estiloPreferido é sempre um array
      this.estiloPreferido = Array.isArray(perfil.estiloPreferido)
        ? perfil.estiloPreferido
        : perfil.estiloPreferido
        ? [perfil.estiloPreferido]
        : [];
    }
  }

  // Carrega os filmes da lista "Favoritos"
  async carregarFavoritos() {
    const listas = await this.storage.get('listas');
    const favoritos = listas?.find((l: any) => l.nome === 'Favoritos');
    this.favoritos = favoritos?.filmes || [];
  }

  // Devolve o nome do género a partir do id
  getGeneroNome(id: number): string {
    const genero = this.generos.find(g => g.id === id);
    return genero ? genero.name : id.toString();
  }

  // Faz logout e limpa dados locais
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

  // Navega para a página de edição de perfil
  editarPerfil() {
    this.router.navigate(['/editar-perfil']);
  }

  // Navega para a pesquisa
  navegarParaPesquisa() {
    this.router.navigate(['/tabs/search']);
  }
}