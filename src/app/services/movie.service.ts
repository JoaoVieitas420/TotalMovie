// src/app/services/movie.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Substitui pelo teu token pessoal da conta TMDB (v4)
const BEARER_TOKEN = 'Bearer API_KEY_HERE';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private headers = new HttpHeaders({
    accept: 'application/json',
    Authorization: BEARER_TOKEN
  });

  constructor(private http: HttpClient) {}

  // 🎬 Get movie details by ID
  getMovieDetails(id: number): Observable<any> {
    return this.http.get(`${BASE_URL}/movie/${id}`, { headers: this.headers });
  }

  // 🔍 Search movies
  searchMovies(query: string): Observable<any> {
    return this.http.get(`${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`, { headers: this.headers });
  }

  // 🌟 Popular movies
  getPopularMovies(): Observable<any> {
    return this.http.get(`${BASE_URL}/movie/popular`, { headers: this.headers });
  }

  // 🖼️ Full image URL
  getImageUrl(path: string, size: string = 'w500'): string {
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  // 📺 Get watch providers for a movie
  getWatchProviders(id: number): Observable<any> {
    return this.http.get(`${BASE_URL}/movie/${id}/watch/providers`, { headers: this.headers });
  }

  // 🎥 Now playing movies
  getNowPlaying(): Observable<any> {
    return this.http.get(`${BASE_URL}/movie/now_playing?language=pt-PT`, { headers: this.headers });
  }

  // 🌟 Popular movies (Portuguese)
  getPopular(): Observable<any> {
    return this.http.get(`${BASE_URL}/movie/popular?language=pt-PT`, { headers: this.headers });
  }

 // 📂 Get movie genres
 getGenres(): Observable<any> {
  return this.http.get(`${BASE_URL}/genre/movie/list?language=pt-PT`, { headers: this.headers });
}

// 🏷️ Get certification ratings
getCertifications(): Observable<any> {
  return this.http.get(`${BASE_URL}/certification/movie/list`, { headers: this.headers });
}

// 📺 Get available streaming providers in a region
getStreamingProviders(countryCode: string): Observable<any> {
  return this.http.get(`${BASE_URL}/watch/providers/movie?watch_region=${countryCode}`, { headers: this.headers });
}

// 🎯 Discover movies based on filters
discoverMovies(params: any): Observable<any> {
  return this.http.get(`${BASE_URL}/discover/movie`, {
    headers: this.headers,
    params: params
  });
}
}
