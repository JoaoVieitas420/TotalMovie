import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init(); // Inicializa o storage ao criar o serviço
  }

  // Inicializa o storage local
  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Regista um novo utilizador (email e password)
  async register(email: string, password: string) {
    const user = await this._storage?.get(email);
    if (user) {
      throw new Error('Email já registado'); // Impede registo duplicado
    }
    await this._storage?.set(email, { email, password }); // Guarda o utilizador
    return true;
  }

  // Faz login: verifica credenciais e guarda sessão
  async login(email: string, password: string) {
    const user = await this._storage?.get(email);
    if (user && user.password === password) {
      await this._storage?.set('session', email); // Guarda o email da sessão ativa
      return true;
    } else {
      throw new Error('Credenciais inválidas'); // Erro se não corresponder
    }
  }

  // Remove a sessão ativa (logout)
  async logout() {
    await this._storage?.remove('session');
  }

  // Obtém o email da sessão ativa (se existir)
  async getSession() {
    return await this._storage?.get('session');
  }
}
