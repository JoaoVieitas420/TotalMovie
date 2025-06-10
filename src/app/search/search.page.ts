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
  @ViewChild(IonSearchbar, { static: false }) searchbar!: IonSearchbar; // Referência ao componente de searchbar

  query = '';                // Guarda o texto da pesquisa
  resultados: any[] = [];    // Guarda os resultados da pesquisa

  constructor(private omdbService: OmdbService) {}

  // Foca automaticamente a searchbar ao entrar na página
  ngAfterViewInit() {
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 300); // Pequeno delay para garantir que a view está pronta
  }

  // Pesquisa filmes no OMDb sempre que o utilizador escreve
  procurar() {
    if (this.query.trim().length < 2) return; // Só pesquisa se houver pelo menos 2 caracteres

    this.omdbService.searchMovies(this.query).subscribe((res: any) => {
      this.resultados = res.Search || []; // Atualiza os resultados com a resposta da API
    });
  }
}