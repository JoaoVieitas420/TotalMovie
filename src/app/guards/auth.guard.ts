import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const session = await this.auth.getSession();

    if (session) {
      // ✅ sessão existe, pode entrar
      return true;
    } else {
      //  sem sessão, redireciona para login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
