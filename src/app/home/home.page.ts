import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OmdbService } from '../services/omdb.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  destaques: any[] = [
    { titulo: 'Interstellar' },
    { titulo: 'Oppenheimer' },
    { titulo: 'Barbie' }
  ];
  populares: any[] = [
    { titulo: 'Avengers: Endgame' },
    { titulo: 'Joker' },
    { titulo: 'Inception' }
  ];
  isLoading = true;
  slideOpts = {
    slidesPerView: 2.2,
    spaceBetween: 10
  };

  constructor(public router: Router, private omdbService: OmdbService) {}

  async ngOnInit() {
    const destaquesResults = await Promise.all(
      this.destaques.map(movie => firstValueFrom(this.omdbService.getMovieByTitle(movie.titulo)))
    );
    const popularesResults = await Promise.all(
      this.populares.map(movie => firstValueFrom(this.omdbService.getMovieByTitle(movie.titulo)))
    );
    this.destaques = destaquesResults;
    this.populares = popularesResults;
    this.isLoading = false;
  }

  verDetalhes(id: string) {
    this.router.navigate(['/movie', id]);
  }
}
