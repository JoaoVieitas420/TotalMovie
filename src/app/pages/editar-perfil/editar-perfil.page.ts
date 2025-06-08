import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { MovieService } from 'src/app/services/movie.service';

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
  estiloPreferido: string[] = []; // Agora é array
  generos: any[] = [];

  constructor(
    private router: Router,
    private storage: Storage,
    private movieService: MovieService
  ) {
    this.initStorage();
    this.carregarGeneros();
  }

  async initStorage() {
    await this.storage.create();
    await this.carregarPerfil();
  }

  async ionViewWillEnter() {
    await this.carregarPerfil();
  }

  async carregarPerfil() {
    const sessionEmail = await this.storage.get('session');
    if (sessionEmail) {
      this.email = sessionEmail;
      const perfil = await this.storage.get(`perfil-${sessionEmail}`);
      if (perfil) {
        this.nome = perfil.nome || '';
        this.fotoPreview = perfil.foto || null;
        this.bio = perfil.bio || '';
        this.localizacao = perfil.localizacao || '';
        this.estiloPreferido = Array.isArray(perfil.estiloPreferido)
          ? perfil.estiloPreferido
          : perfil.estiloPreferido
            ? [perfil.estiloPreferido]
            : [];
      }
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
      estiloPreferido: this.estiloPreferido // Guarda como array
    });

    alert('Perfil atualizado com sucesso!');
    this.router.navigateByUrl('/tabs/home').then(() => {
      this.router.navigateByUrl('/tabs/perfil', { replaceUrl: true });
    });
  }

  async carregarGeneros() {
    this.movieService.getGenres().subscribe((res: any) => {
      this.generos = res.genres || [];
    });
  }
}