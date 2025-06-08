import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

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
  certificacaoSelecionada = '';
  providerSelecionado = '';
  sortSelecionado = 'popularity.desc';

  carregando = false;

  constructor(
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarFiltros();
    this.descobrirFilmes(true);
  }

  carregarFiltros() {
    this.movieService.getGenres().subscribe((res: any) => {
      this.generos = res.genres;
    });
    this.movieService.getCertifications().subscribe((res: any) => {
      this.certificacoes = res.certifications?.PT || [];
    });
    this.movieService.getStreamingProviders('PT').subscribe((res: any) => {
      this.providers = res.results || [];
    });
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
    if (this.certificacaoSelecionada) {
      params.certification = this.certificacaoSelecionada;
      params.certification_country = 'PT';
    }
    if (this.providerSelecionado) {
      params.with_watch_providers = this.providerSelecionado;
    }
    // Só filmes até à data atual se for "Mais recentes"
    if (this.sortSelecionado === 'release_date.desc') {
      params['release_date.lte'] = new Date().toISOString().slice(0, 10);
    }

    this.movieService.discoverMovies(params).subscribe((res: any) => {
      this.totalPaginas = res.total_pages;
      const filmesRecebidos = reset ? res.results : this.filmes.concat(res.results);

      // Buscar detalhes de cada filme para garantir imdb_id
      const detalhes$ = filmesRecebidos.map((movie: any) =>
        this.movieService.getMovieDetails(movie.id)
      );
      forkJoin<any[]>(detalhes$).subscribe((detalhes: any[]) => {
        // Só filmes com imdb_id válido
        const filmesComImdb = detalhes.filter(f => !!f.imdb_id);
        this.filmes = filmesComImdb;
        this.atualizarFilmesVisiveis();
        this.carregando = false;
        if (event) event.target.complete();
      });
    });
  }

  atualizarFilmesVisiveis() {
    this.filmesVisiveis = this.filmes;
  }

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
