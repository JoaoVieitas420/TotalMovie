import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-recomendacoes',
  templateUrl: './recomendacoes.page.html',
  styleUrls: ['./recomendacoes.page.scss'],
  standalone: false
})
export class RecomendacoesPage implements OnInit {
  // Listas de filmes e filtros
  filmes: any[] = [];                // Todos os filmes carregados
  filmesVisiveis: any[] = [];        // Filmes atualmente visíveis na página
  paginaAtual = 1;                   // Página atual para paginação
  totalPaginas = 1;                  // Total de páginas disponíveis
  filmesPorPagina = 20;              // Quantos filmes mostrar por página

  // Filtros de pesquisa
  generos: any[] = [];               // Lista de géneros disponíveis
  certificacoes: any[] = [];         // Lista de certificações disponíveis
  providers: any[] = [];             // Lista de providers de streaming disponíveis
  generosSelecionados: number[] = [];        // Géneros selecionados pelo utilizador
  certificacoesSelecionadas: string[] = [];  // Certificações selecionadas
  providersSelecionados: string[] = [];      // Providers selecionados
  certificacaoSelecionada = '';
  providerSelecionado = '';
  sortSelecionado = 'popularity.desc';       // Critério de ordenação

  carregando = false;                // Estado de carregamento

  constructor(
    private movieService: MovieService,
    private router: Router,
    private storage: Storage
  ) {}

  // Ao iniciar, carrega filtros e preenche géneros preferidos do perfil
  async ngOnInit() {
    await this.storage.create();
    await this.carregarFiltrosComPreferidos();
    this.descobrirFilmes(true);
  }

  // Carrega géneros, certificações e providers, e preenche géneros preferidos do perfil
  async carregarFiltrosComPreferidos() {
    // Carrega géneros primeiro (necessário para preencher preferidos)
    await new Promise<void>((resolve) => {
      this.movieService.getGenres().subscribe((res: any) => {
        this.generos = res.genres;
        resolve();
      });
    });

    // Carrega certificações e providers
    this.movieService.getCertifications().subscribe((res: any) => {
      this.certificacoes = res.certifications?.PT || [];
    });
    this.movieService.getStreamingProviders('PT').subscribe((res: any) => {
      this.providers = res.results || [];
    });

    // Preenche géneros preferidos do utilizador autenticado
    await this.preencherGenerosPreferidos();
  }

  // Lê os géneros preferidos do perfil do utilizador autenticado
  async preencherGenerosPreferidos() {
    const sessionEmail = await this.storage.get('session');
    if (!sessionEmail) return;
    const perfil = await this.storage.get(`perfil-${sessionEmail}`);
    if (perfil && perfil.estiloPreferido) {
      if (Array.isArray(perfil.estiloPreferido)) {
        this.generosSelecionados = perfil.estiloPreferido;
      } else if (typeof perfil.estiloPreferido === 'number') {
        this.generosSelecionados = [perfil.estiloPreferido];
      }
    }
  }

  // Descobre filmes com base nos filtros selecionados
  descobrirFilmes(reset = false, event?: any) {
    if (reset) {
      this.paginaAtual = 1;
      this.filmes = [];
      this.filmesVisiveis = [];
    }
    this.carregando = true;

    // Monta os parâmetros de pesquisa para a API
    const params: any = {
      page: this.paginaAtual,
      sort_by: this.sortSelecionado,
      language: 'pt-PT',
      watch_region: 'PT'
    };

    if (this.generosSelecionados.length > 0) {
      params.with_genres = this.generosSelecionados.join(',');
    }
    if (this.certificacoesSelecionadas.length > 0) {
      params.certification = this.certificacoesSelecionadas.join('|');
      params.certification_country = 'PT';
    }
    if (this.providersSelecionados.length > 0) {
      params.with_watch_providers = this.providersSelecionados.join('|');
    }
    if (this.sortSelecionado === 'release_date.desc') {
      params['release_date.lte'] = new Date().toISOString().slice(0, 10);
    }

    // Faz o pedido à API e processa os resultados
    this.movieService.discoverMovies(params).subscribe((res: any) => {
      this.totalPaginas = res.total_pages;
      const filmesRecebidos = res.results;

      // Busca detalhes de cada filme para garantir imdb_id
      const detalhes$ = filmesRecebidos.map((movie: any) =>
        this.movieService.getMovieDetails(movie.id)
      );
      forkJoin<any[]>(detalhes$).subscribe((detalhes: any[]) => {
        const filmesComImdb = detalhes.filter(f => !!f.imdb_id);

        // Acrescenta os novos filmes à lista visível
        if (reset) {
          this.filmes = filmesComImdb;
          this.filmesVisiveis = [...filmesComImdb];
        } else {
          this.filmes = this.filmes.concat(filmesComImdb);
          this.filmesVisiveis = this.filmesVisiveis.concat(filmesComImdb);
        }

        this.carregando = false;
        if (event) event.target.complete();
      });
    });
  }

  // Atualiza os filmes visíveis (pode ser usado para filtros locais)
  atualizarFilmesVisiveis() {}

  // Carrega mais filmes ao fazer scroll (infinite scroll)
  carregarMaisFilmes(event: any) {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.descobrirFilmes(false, event);
    } else {
      event.target.disabled = true;
    }
  }

  // Sempre que um filtro muda, reinicia a pesquisa
  onFiltroChange() {
    this.descobrirFilmes(true);
  }

  // Ao clicar num filme, navega para a página de detalhes (usando imdb_id)
  verDetalhes(movie: any) {
    this.movieService.getMovieDetails(movie.id).subscribe((details: any) => {
      if (details.imdb_id) {
        this.router.navigate(['/movie-detail', details.imdb_id]);
      } else {
        alert('IMDb ID não encontrado para este filme.');
      }
    });
  }

  // Devolve o URL do poster do filme ou imagem de fallback
  getPosterUrl(movie: any): string {
    if (movie.poster_path) {
      return 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    }
    return 'assets/defaultmovie.jpg';
  }

  // Devolve os nomes dos géneros do filme (ex: "Ação, Comédia")
  getGenerosNomes(movie: any): string {
    if (!movie.genre_ids || !this.generos.length) return '';
    return movie.genre_ids
      .map((id: number) => {
        const genero = this.generos.find(g => g.id === id);
        return genero ? genero.name : '';
      })
      .filter((name: string) => !!name)
      .join(', ');
  }

  // Navega para a página de pesquisa
  public navegarParaPesquisa() {
    this.router.navigate(['/tabs/search']);
  }
}
