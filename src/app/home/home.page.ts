import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { OmdbService } from '../services/omdb.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  destaques: any[] = []; // Filmes em destaque (lançamentos)
  populares: any[] = []; // Filmes populares
  isLoading = true;      // Estado de carregamento

  constructor(
    public router: Router,
    private movieService: MovieService,
    private omdbService: OmdbService
  ) {}

  ngOnInit() {
    // Carrega os lançamentos (now playing) do TMDB
    this.movieService.getNowPlaying().subscribe((res: any) => {
      const tmdbMovies = res.results || [];
      // Para cada filme, tenta obter detalhes do OMDb usando o imdb_id
      Promise.all(
        tmdbMovies.map((movie: any) =>
          movie.imdb_id
            ? this.omdbService.getMovieById(movie.imdb_id).toPromise()
            : this.movieService.getMovieDetails(movie.id).toPromise().then((details: any) =>
                details.imdb_id
                  ? this.omdbService.getMovieById(details.imdb_id).toPromise()
                  : null
              )
        )
      ).then((movies: any[]) => {
        // Guarda apenas filmes válidos
        this.destaques = movies.filter(m => m && m.Response !== 'False');
        this.isLoading = false;
      });
    });

    // Carrega os filmes populares do TMDB
    this.movieService.getPopular().subscribe((res: any) => {
      const tmdbMovies = res.results || [];
      // Para cada filme, tenta obter detalhes do OMDb usando o imdb_id
      Promise.all(
        tmdbMovies.map((movie: any) =>
          movie.imdb_id
            ? this.omdbService.getMovieById(movie.imdb_id).toPromise()
            : this.movieService.getMovieDetails(movie.id).toPromise().then((details: any) =>
                details.imdb_id
                  ? this.omdbService.getMovieById(details.imdb_id).toPromise()
                  : null
              )
        )
      ).then((movies: any[]) => {
        // Guarda apenas filmes válidos
        this.populares = movies.filter(m => m && m.Response !== 'False');
      });
    });
  }

  // Navega para a página de detalhes do filme ao clicar num card
  verDetalhes(imdbID: string) {
    this.router.navigate(['/movie-detail', imdbID]);
  }
}
