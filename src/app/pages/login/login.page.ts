import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    try {
      await this.auth.login(this.email, this.password);
      alert('Login com sucesso!');
      
      // ⚠️ Força a navegação no ciclo seguinte (resolve problemas de race condition)
      setTimeout(() => {
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      }, 0);
      
    } catch (e: any) {
      alert(e.message);
    }
  }
}
