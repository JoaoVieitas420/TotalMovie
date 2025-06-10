import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: false,
})
export class LoginPage {
  email = '';                // Guarda o email introduzido pelo utilizador
  password = '';             // Guarda a password introduzida
  emailTouched = false;      // Indica se o campo de email já foi tocado (para validação visual)
  passwordTouched = false;   // Indica se o campo de password já foi tocado

  constructor(private auth: AuthService, private router: Router) {}

  // Método chamado ao clicar no botão de login
  async login() {
    this.emailTouched = true;
    this.passwordTouched = true;

    // Só tenta login se o formulário for válido
    if (!this.isFormValid()) return;

    try {
      // Tenta autenticar o utilizador com o AuthService
      await this.auth.login(this.email, this.password);
      alert('Login com sucesso!');

      // Redireciona para a página principal após login
      setTimeout(() => {
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      }, 0);
    } catch (e: any) {
      // Mostra mensagem de erro se o login falhar
      alert(e.message);
    }
  }

  // Valida o formato do email
  isEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Valida se a password tem pelo menos 6 caracteres
  isPasswordValid(password: string): boolean {
    return password.length >= 6;
  }

  // Valida se o formulário está pronto para submeter
  isFormValid(): boolean {
    return this.isEmailValid(this.email) && this.isPasswordValid(this.password);
  }
}
