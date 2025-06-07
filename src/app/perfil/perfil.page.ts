import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {
  nome: string = '';
  email: string = '';
  profilePhotoUrl: string = 'assets/img/default-profile.jpg';
  bio: string = '';
  localizacao: string = '';
  estiloPreferido: string = '';


  constructor(private router: Router, private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    await this.carregarPerfil();
  }

  async ionViewWillEnter() {
    await this.carregarPerfil();
  }

  async carregarPerfil() {
    const sessionEmail = await this.storage.get('session');
    console.log('Email da sessão atual:', sessionEmail); // 👈 VERIFICA AQUI
    if (!sessionEmail) return;
  
    const perfil = await this.storage.get(`perfil-${sessionEmail}`);
    console.log('Perfil carregado:', perfil); // 👈 VERIFICA AQUI

    if (perfil) {
      this.nome = perfil.nome || '';
      this.email = perfil.email || '';
      this.profilePhotoUrl = perfil.foto || 'assets/img/default-profile.jpg';
      this.bio = perfil.bio || '';
      this.localizacao = perfil.localizacao || '';
      this.estiloPreferido = perfil.estiloPreferido || '';
    }
  }

  async logout() {
  await this.storage.remove('session');

  // Limpa os dados locais para não mostrar dados antigos
  this.nome = '';
  this.email = '';
  this.bio = '';
  this.localizacao = '';
  this.estiloPreferido = '';
  this.profilePhotoUrl = 'assets/img/default-profile.jpg';

  // Navega para login com replace para evitar voltar atrás
  this.router.navigateByUrl('/login', { replaceUrl: true });
}

  editarPerfil() {
    this.router.navigate(['/editar-perfil']);
  }

  navegarParaPesquisa() {
    this.router.navigate(['/tabs/search']);
  }
}
