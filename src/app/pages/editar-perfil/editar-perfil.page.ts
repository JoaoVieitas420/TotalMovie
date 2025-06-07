import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: false,
})
export class EditarPerfilPage {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    nome: string = '';
    email: string = '';
    fotoPreview: string | ArrayBuffer | null = null;
    bio: string = '';
    localizacao: string = '';
    estiloPreferido: string = '';

  constructor(private router: Router, private storage: Storage) {
    this.initStorage();
  }

  async initStorage() {
    const sessionEmail = await this.storage.get('session');
    if (!sessionEmail) return;
  
    const perfil = await this.storage.get(`perfil-${sessionEmail}`);
    if (perfil) {
      this.nome = perfil.nome || '';
      this.email = perfil.email || '';
      this.fotoPreview = perfil.foto || 'assets/img/default-profile.jpg';
      this.bio = perfil.bio || '';
      this.localizacao = perfil.localizacao || '';
      this.estiloPreferido = perfil.estiloPreferido || '';
    }
  }

  abrirSeletor() {
    this.fileInput.nativeElement.click();
    }
    
  selecionarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  async ionViewWillEnter() {
    await this.initStorage();
  }
    async ionViewDidEnter() {
        await this.initStorage();
    }  

  async guardar() {
    const sessionEmail = await this.storage.get('session');
    if (!sessionEmail) return;
  
    await this.storage.set(`perfil-${sessionEmail}`, {
      nome: this.nome,
      email: this.email,
      foto: this.fotoPreview,
      bio: this.bio,
      localizacao: this.localizacao,
      estiloPreferido: this.estiloPreferido
    });
  
    alert('Perfil atualizado com sucesso!');
    this.router.navigateByUrl('/tabs/home').then(() => {
        this.router.navigateByUrl('/tabs/perfil', { replaceUrl: true });
      });
  }
}
