import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: false, // Definido como false para compatibilidade com Ionic
})
export class RegisterPage {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    try {
      await this.auth.register(this.email, this.password);
      alert('Conta criada com sucesso!');
      this.router.navigateByUrl('/login');
    } catch (e: any) {
      alert(e.message);
    }
  }
}
