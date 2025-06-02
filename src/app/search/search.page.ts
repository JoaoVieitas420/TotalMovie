import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { OmdbService } from '../services/omdb.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage implements AfterViewInit {
  @ViewChild(IonSearchbar, { static: false }) searchbar!: IonSearchbar;

  query = '';
  resultados: any[] = [];

  constructor(private omdbService: OmdbService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 300); // Delay to ensure the view is ready
  }

  procurar() {
    if (this.query.trim().length < 2) return;

    this.omdbService.searchMovies(this.query).subscribe((res: any) => {
      this.resultados = res.Search || [];
    });
  }
}