import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _initialized = false;

  constructor(private storage: Storage, private alertCtrl: AlertController) {}

  async init() {
    if (!this._initialized) {
      await this.storage.create();
      this._initialized = true;
    }
  }

  async getListas(): Promise<any[]> {
    await this.init();
    return (await this.storage.get('listas')) || [];
  }

  async saveLista(novaLista: any) {
    const listas = await this.getListas();
    listas.push(novaLista);
    await this.storage.set('listas', listas);
  }

  async updateListas(listas: any[]) {
    await this.init();
    await this.storage.set('listas', listas);
  }

  async addFilmeALista(nomeLista: string, filme: any) {
    const listas = await this.getListas();
    const lista = listas.find(l => l.nome === nomeLista);
    if (lista) {
      if (!Array.isArray(lista.filmes)) {
        lista.filmes = [];
      }
      // Verifica se já existe o filme (por ID ou título)
      const jaExiste = lista.filmes.some((f: any) => f.imdbID === filme.imdbID);
      if (jaExiste) {
        throw new Error('Este filme já está nesta lista.');
      }
      lista.filmes.push(filme);
      await this.storage.set('listas', listas);
    }
  }

  async getListaByNome(nomeLista: string) {
    const listas = await this.getListas();
    return listas.find(l => l.nome === nomeLista);
  }

  // No método de inicialização do StorageService
  async ensureFavoritos() {
    let listas = await this.getListas();
    if (!listas.find(l => l.nome === 'Favoritos')) {
      listas.unshift({ nome: 'Favoritos', filmes: [] });
      await this.updateListas(listas);
    }
  }

  // Chama este método no início da app ou em ionViewWillEnter das páginas de listas/perfil
  async removerPlaylist(index: number) {
    const listas = await this.getListas();
    if (listas[index].nome === 'Favoritos') {
      const alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: 'A lista "Favoritos" não pode ser apagada.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    listas.splice(index, 1);
    await this.storage.set('listas', listas);
  }
}
