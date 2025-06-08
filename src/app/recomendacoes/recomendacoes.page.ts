import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular'; // <-- Adiciona isto

@Component({
  selector: 'app-recomendacoes',
  templateUrl: './recomendacoes.page.html',
  styleUrls: ['./recomendacoes.page.scss'],
  standalone: false
})
export class RecomendacoesPage implements OnInit {
  filmes: any[] = [];
  filmesVisiveis: any[] = [];
  paginaAtual = 1;
  totalPaginas = 1;
  filmesPorPagina = 20;

  // Filtros
  generos: any[] = [];
  certificacoes: any[] = [];
  providers: any[] = [];
  generosSelecionados: number[] = [];
  certificacoesSelecionadas: string[] = [];
  providersSelecionados: string[] = [];
  certificacaoSelecionada = '';
  providerSelecionado = '';
  sortSelecionado = 'popularity.desc';

  carregando = false;

  constructor(
    private movieService: MovieService,
    private router: Router,
    private storage: Storage // <-- Adiciona isto
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.carregarFiltrosComPreferidos();
    this.descobrirFilmes(true);
  }

  async carregarFiltrosComPreferidos() {
    // Carrega géneros primeiro
    await new Promise<void>((resolve) => {
      this.movieService.getGenres().subscribe((res: any) => {
        this.generos = res.genres;
        resolve();
      });
    });

    // Carrega os outros filtros normalmente
    this.movieService.getCertifications().subscribe((res: any) => {
      this.certificacoes = res.certifications?.PT || [];
    });
    this.movieService.getStreamingProviders('PT').subscribe((res: any) => {
      this.providers = res.results || [];
    });

    // Só depois de ter os géneros carregados, preenche os selecionados
    await this.preencherGenerosPreferidos();
  }

  async preencherGenerosPreferidos() {
    const sessionEmail = await this.storage.get('session');
    if (!sessionEmail) return;
    const perfil = await this.storage.get(`perfil-${sessionEmail}`);
    if (perfil && perfil.estiloPreferido) {
      // Se o utilizador pode escolher vários estilos, estiloPreferido deve ser um array de ids
      // Se for só um, pode ser string ou id
      // Aqui assumimos que é um array de ids (ajusta conforme o teu modelo)
      if (Array.isArray(perfil.estiloPreferido)) {
        this.generosSelecionados = perfil.estiloPreferido;
      } else if (typeof perfil.estiloPreferido === 'number') {
        this.generosSelecionados = [perfil.estiloPreferido];
      }
    }
  }

  descobrirFilmes(reset = false, event?: any) {
    if (reset) {
      this.paginaAtual = 1;
      this.filmes = [];
      this.filmesVisiveis = [];
    }
    this.carregando = true;

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

    this.movieService.discoverMovies(params).subscribe((res: any) => {
      this.totalPaginas = res.total_pages;
      const filmesRecebidos = res.results;

      // Buscar detalhes de cada filme para garantir imdb_id
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

  atualizarFilmesVisiveis() {}

  carregarMaisFilmes(event: any) {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.descobrirFilmes(false, event);
    } else {
      event.target.disabled = true;
    }
  }

  onFiltroChange() {
    this.descobrirFilmes(true);
  }

  verDetalhes(movie: any) {
    this.movieService.getMovieDetails(movie.id).subscribe((details: any) => {
      if (details.imdb_id) {
        this.router.navigate(['/movie-detail', details.imdb_id]);
      } else {
        alert('IMDb ID não encontrado para este filme.');
      }
    });
  }

  getPosterUrl(movie: any): string {
    if (movie.poster_path) {
      return 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    }
    return 'assets/defaultmovie.jpg';
  }

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
}
