import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async register(email: string, password: string) {
    const user = await this._storage?.get(email);
    if (user) {
      throw new Error('Email já registado');
    }
    await this._storage?.set(email, { email, password });
    return true;
  }

  async login(email: string, password: string) {
    const user = await this._storage?.get(email);
    if (user && user.password === password) {
      await this._storage?.set('session', email);
      return true;
    } else {
      throw new Error('Credenciais inválidas');
    }
  }

  async logout() {
    await this._storage?.remove('session');
  }

  async getSession() {
    return await this._storage?.get('session');
  }
}
