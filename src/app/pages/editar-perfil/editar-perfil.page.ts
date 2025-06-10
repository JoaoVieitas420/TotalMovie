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
  estiloPreferido: string[] = []; // Guarda os géneros preferidos como array
  generos: any[] = [];            // Lista de géneros disponíveis

  constructor(
    private router: Router,
    private storage: Storage,
    private movieService: MovieService
  ) {
    this.initStorage();      // Inicializa o storage e carrega perfil ao criar componente
    this.carregarGeneros();  // Carrega géneros de filmes disponíveis
  }

  // Inicializa o storage e carrega o perfil do utilizador
  async initStorage() {
    await this.storage.create();
    await this.carregarPerfil();
  }

  // Sempre que entra na página, carrega o perfil atualizado
  async ionViewWillEnter() {
    await this.carregarPerfil();
  }

  // Carrega os dados do perfil do utilizador autenticado
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
        // Garante que estiloPreferido é sempre um array
        this.estiloPreferido = Array.isArray(perfil.estiloPreferido)
          ? perfil.estiloPreferido
          : perfil.estiloPreferido
            ? [perfil.estiloPreferido]
            : [];
      }
    }
  }

  // Abre o seletor de ficheiros para escolher nova foto de perfil
  abrirSeletor() {
    this.fileInput.nativeElement.click();
  }

  // Lê e mostra a foto selecionada pelo utilizador
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

  // Também inicializa o storage ao entrar na página (caso necessário)
  async ionViewDidEnter() {
    await this.initStorage();
  }

  // Guarda as alterações feitas no perfil do utilizador
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
    // Redireciona para o perfil após guardar
    this.router.navigateByUrl('/tabs/home').then(() => {
      this.router.navigateByUrl('/tabs/perfil', { replaceUrl: true });
    });
  }

  // Carrega a lista de géneros de filmes disponíveis (para o select)
  async carregarGeneros() {
    this.movieService.getGenres().subscribe((res: any) => {
      this.generos = res.genres || [];
    });
  }
}