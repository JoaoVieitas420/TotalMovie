import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _initialized = false; // Garante que o storage só é inicializado uma vez

  constructor(private storage: Storage, private alertCtrl: AlertController) {}

  // Inicializa o storage se ainda não estiver pronto
  async init() {
    if (!this._initialized) {
      await this.storage.create();
      this._initialized = true;
    }
  }

  // Obtém todas as listas guardadas no storage
  async getListas(): Promise<any[]> {
    await this.init();
    return (await this.storage.get('listas')) || [];
  }

  // Adiciona uma nova lista ao storage
  async saveLista(novaLista: any) {
    const listas = await this.getListas();
    listas.push(novaLista);
    await this.storage.set('listas', listas);
  }

  // Atualiza todas as listas no storage
  async updateListas(listas: any[]) {
    await this.init();
    await this.storage.set('listas', listas);
  }

  // Adiciona um filme a uma lista específica, evitando duplicados
  async addFilmeALista(nomeLista: string, filme: any) {
    const listas = await this.getListas();
    const lista = listas.find(l => l.nome === nomeLista);
    if (lista) {
      if (!Array.isArray(lista.filmes)) {
        lista.filmes = [];
      }
      // Verifica se já existe o filme (por imdbID)
      const jaExiste = lista.filmes.some((f: any) => f.imdbID === filme.imdbID);
      if (jaExiste) {
        throw new Error('Este filme já está nesta lista.');
      }
      lista.filmes.push(filme);
      await this.storage.set('listas', listas);
    }
  }

  // Obtém uma lista pelo nome
  async getListaByNome(nomeLista: string) {
    const listas = await this.getListas();
    return listas.find(l => l.nome === nomeLista);
  }

  // Garante que a lista "Favoritos" existe sempre no início da app
  async ensureFavoritos() {
    let listas = await this.getListas();
    if (!listas.find(l => l.nome === 'Favoritos')) {
      listas.unshift({ nome: 'Favoritos', filmes: [] });
      await this.updateListas(listas);
    }
  }

  // Remove uma playlist, mas impede apagar a lista "Favoritos"
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
