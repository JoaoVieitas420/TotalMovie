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
  destaques: any[] = [];
  populares: any[] = [];
  isLoading = true;

  constructor(
    public router: Router,
    private movieService: MovieService,
    private omdbService: OmdbService
  ) {}

  ngOnInit() {
    // Lançamentos (now playing)
    this.movieService.getNowPlaying().subscribe((res: any) => {
      const tmdbMovies = res.results || [];
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
        this.destaques = movies.filter(m => m && m.Response !== 'False');
        this.isLoading = false;
      });
    });

    // Populares
    this.movieService.getPopular().subscribe((res: any) => {
      const tmdbMovies = res.results || [];
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
        this.populares = movies.filter(m => m && m.Response !== 'False');
      });
    });
  }

  verDetalhes(imdbID: string) {
    this.router.navigate(['/movie-detail', imdbID]);
  }
}
