import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OmdbService } from '../services/omdb.service';
import { StorageService } from '../services/storage.service';
import { ModalController, AlertController } from '@ionic/angular';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.page.html',
  styleUrls: ['./movie-detail.page.scss'],
  standalone: false,
})
export class MovieDetailPage implements OnInit {

  movie: any = null;
  isLoading = true;
  listas: any[] = [];
  streamingProviders: any[] = [];
  rentProviders: any[] = [];
  buyProviders: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private omdbService: OmdbService,
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private movieService: MovieService
  ) {}

  async ngOnInit() {
    const imdbID = this.route.snapshot.paramMap.get('id');
    if (imdbID) {
      this.omdbService.getMovieById(imdbID).subscribe((res: any) => {
        this.movie = res;
        this.isLoading = false;
        if (res?.Title) {
          this.buscarProvedoresTMDB(res.Title);
        }
      });
    }
    this.listas = await this.storageService.getListas();
  }

  buscarProvedoresTMDB(title: string) {
    this.movieService.searchMovies(title).subscribe((res: any) => {
      if (res && res.results && res.results.length > 0) {
        const tmdbId = res.results[0].id;
        this.movieService.getWatchProviders(tmdbId).subscribe((provRes: any) => {
          const pt = provRes.results?.PT;
          this.streamingProviders = pt?.flatrate?.map((prov: any) => ({
            name: prov.provider_name,
            logo: 'https://image.tmdb.org/t/p/w92' + prov.logo_path,
            link: pt.link,
            type: 'Streaming'
          })) || [];
          this.rentProviders = pt?.rent?.map((prov: any) => ({
            name: prov.provider_name,
            logo: 'https://image.tmdb.org/t/p/w92' + prov.logo_path,
            link: pt.link,
            type: 'Alugar'
          })) || [];
          this.buyProviders = pt?.buy?.map((prov: any) => ({
            name: prov.provider_name,
            logo: 'https://image.tmdb.org/t/p/w92' + prov.logo_path,
            link: pt.link,
            type: 'Comprar'
          })) || [];
        });
      }
    });
  }

  async abrirAdicionarLista() {
    this.listas = await this.storageService.getListas();
    // Only lists where the movie is not already present
    const listasDisponiveis = this.listas.filter(
      lista => !lista.filmes?.some((f: any) => f.imdbID === this.movie.imdbID)
    );
    const inputs = listasDisponiveis.map(lista => ({
      name: 'lista',
      type: 'radio' as const,
      label: lista.nome,
      value: lista.nome
    }));

    inputs.push({
      name: 'nova',
      type: 'radio' as const,
      label: 'Criar nova lista',
      value: '__nova__'
    });

    const alert = await this.alertCtrl.create({
      header: 'Adicionar à lista',
      inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: async (selected) => {
            if (selected === '__nova__') {
              this.criarNovaLista();
            } else if (selected) {
              try {
                await this.storageService.addFilmeALista(selected, this.movie);
              } catch (e: any) {
                const erro = await this.alertCtrl.create({
                  header: 'Erro',
                  message: e.message || 'Erro ao adicionar filme.',
                  buttons: ['OK']
                });
                await erro.present();
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async criarNovaLista() {
    const alert = await this.alertCtrl.create({
      header: 'Nova Lista',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome da lista'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Criar',
          handler: async (data) => {
            if (data.nome && data.nome.trim()) {
              await this.storageService.saveLista({ nome: data.nome.trim(), filmes: [this.movie] });
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
