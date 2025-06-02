import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-listas',
  templateUrl: './listas.page.html',
  styleUrls: ['./listas.page.scss'],
  standalone: false,
})
export class ListasPage {
  playlists: any[] = [];

  constructor(
    private storageService: StorageService,
    private alertCtrl: AlertController
  ) {}

  async ionViewWillEnter() {
    this.playlists = await this.storageService.getListas();
  }

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
            if (!nome) {
              const erro = await this.alertCtrl.create({
                header: 'Erro',
                message: 'Nome da playlist não pode estar vazio.',
                buttons: ['OK']
              });
              await erro.present();
              return false;
            }
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
            await this.storageService.saveLista({ nome, filmes: [] });
            this.playlists = await this.storageService.getListas();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async removerPlaylist(index: number) {
    const confirmacao = window.confirm(`Tem certeza que deseja apagar a playlist "${this.playlists[index].nome}"?`);
    if (confirmacao) {
      this.playlists.splice(index, 1);
      await this.storageService.updateListas(this.playlists);
      this.playlists = await this.storageService.getListas();
    }
  }

  async removerFilmeDaPlaylist(playlistIndex: number, movieIndex: number) {
    this.playlists[playlistIndex].filmes.splice(movieIndex, 1);
    await this.storageService.updateListas(this.playlists);
    this.playlists = await this.storageService.getListas();
  }
}
