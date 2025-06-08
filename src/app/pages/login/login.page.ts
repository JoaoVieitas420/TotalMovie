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
  emailTouched = false;
  passwordTouched = false;

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.isFormValid()) return;

    try {
      await this.auth.login(this.email, this.password);
      alert('Login com sucesso!');

      setTimeout(() => {
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      }, 0);
    } catch (e: any) {
      alert(e.message);
    }
  }

  isEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isPasswordValid(password: string): boolean {
    return password.length >= 6;
  }

  isFormValid(): boolean {
    return this.isEmailValid(this.email) && this.isPasswordValid(this.password);
  }
}
