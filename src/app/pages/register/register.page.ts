import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: false,
})
export class RegisterPage {
  email = '';
  password = '';
  emailTouched = false;
  passwordTouched = false;

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.isFormValid()) return;

    try {
      await this.auth.register(this.email, this.password);
      alert('Conta criada com sucesso!');
      this.router.navigateByUrl('/login');
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
