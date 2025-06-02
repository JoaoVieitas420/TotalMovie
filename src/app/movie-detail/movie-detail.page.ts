import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OmdbService } from '../services/omdb.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.page.html',
  styleUrls: ['./movie-detail.page.scss'],
  standalone: false,
})
export class MovieDetailPage implements OnInit {

  movie: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private omdbService: OmdbService
  ) {}

  ngOnInit() {
    const imdbID = this.route.snapshot.paramMap.get('id');
    if (imdbID) {
      this.omdbService.getMovieById(imdbID).subscribe((res: any) => {
        this.movie = res;
        this.isLoading = false;
      });
    }
  }

}
