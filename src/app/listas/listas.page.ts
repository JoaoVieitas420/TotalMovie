import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listas',
  templateUrl: './listas.page.html',
  styleUrls: ['./listas.page.scss'],
  standalone: false,
})
export class ListasPage {
  playlists: any[] = []; // Array com todas as playlists do utilizador

  constructor(
    private storageService: StorageService, // Serviço para gerir playlists no storage
    private alertCtrl: AlertController,     // Controlador de alertas para confirmações e erros
    private router: Router                  // Router para navegação entre páginas
  ) {}

  // Garante que a lista "Favoritos" existe ao iniciar a página
  async ngOnInit() {
    await this.storageService.ensureFavoritos();
  }

  // Atualiza as playlists sempre que a página é aberta
  async ionViewWillEnter() {
    this.playlists = await this.storageService.getListas();
  }

  // Abre um alerta para criar uma nova playlist
  async abrirCriarPlaylist() {
    const alert = await this.alertCtrl.create({
      header: 'Nova Playlist',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome da playlist'
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
            const nome = data.nome?.trim();
            // Validação: nome não pode estar vazio
            if (!nome) {
              const erro = await this.alertCtrl.create({
                header: 'Erro',
                message: 'Nome da playlist não pode estar vazio.',
                buttons: ['OK']
              });
              await erro.present();
              return false;
            }
            // Validação: não pode haver playlists com o mesmo nome
            const existe = this.playlists.find(p => p.nome.toLowerCase() === nome.toLowerCase());
            if (existe) {
              const erro = await this.alertCtrl.create({
                header: 'Erro',
                message: 'Já existe uma playlist com esse nome.',
                buttons: ['OK']
              });
              await erro.present();
              return false;
            }
            // Guarda a nova playlist no storage
            await this.storageService.saveLista({ nome, filmes: [] });
            this.playlists = await this.storageService.getListas();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // Remove uma playlist (usa proteção no serviço para não apagar "Favoritos")
  async removerPlaylist(index: number) {
    const playlist = this.playlists[index];
    const alert = await this.alertCtrl.create({
      header: 'Remover Playlist',
      message: `Tem a certeza que deseja remover a playlist "${playlist.nome}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: async () => {
            await this.storageService.removerPlaylist(index);
            this.playlists = await this.storageService.getListas();
          }
        }
      ]
    });
    await alert.present();
  }

  // Remove um filme de uma playlist, com confirmação
  async removerFilmeDaPlaylist(playlistIndex: number, movieIndex: number) {
    const alert = await this.alertCtrl.create({
      header: 'Remover Filme',
      message: 'Tem a certeza que deseja remover este filme da playlist?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: async () => {
            this.playlists[playlistIndex].filmes.splice(movieIndex, 1);
            await this.storageService.updateListas(this.playlists);
            this.playlists = await this.storageService.getListas();
          }
        }
      ]
    });
    await alert.present();
  }

  // Navega para a página de pesquisa
  navegarParaPesquisa() {
    this.router.navigate(['/tabs/search']);
  }
}
