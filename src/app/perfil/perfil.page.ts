import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {

  profilePhotoUrl: string = 'assets/img/default-profile.jpg';

  constructor(
    private router: Router,
  ) {}

  ngOnInit() {}

  selecionarFoto(event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePhotoUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  editarPerfil() {
    // Example: redirects to a route or shows an alert
    // this.router.navigate(['/edit-profile']);

    alert('Função de edição de perfil ainda não implementada.');
  }

  navegarParaPesquisa() {
    this.router.navigate(['/tabs/search']);
  }

}
