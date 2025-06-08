import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OmdbService {

  private apiKey = 'API_KEY_HERE';
  private baseUrl = 'https://www.omdbapi.com/';

  constructor(private http: HttpClient) {}

  // Pesquisa por título
  searchMovies(title: string) {
    return this.http.get(`${this.baseUrl}?apikey=${this.apiKey}&s=${title}`);
  }

  // Detalhes por ID ou título
  getMovieById(imdbID: string) {
    return this.http.get(`${this.baseUrl}?apikey=${this.apiKey}&i=${imdbID}&plot=full`);
  }

  // Obter filme por título
  getMovieByTitle(title: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?t=${encodeURIComponent(title)}&apikey=${this.apiKey}`);
  }
}