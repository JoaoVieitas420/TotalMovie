import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _initialized = false;

  constructor(private storage: Storage) {}

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
}
