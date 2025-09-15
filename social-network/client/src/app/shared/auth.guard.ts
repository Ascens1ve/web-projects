import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ) {
    const isAuth = await this.userService.isAuthenticated();
    const isAuthPage = ['/login', '/registration'].includes(state.url);

    if (!isAuth && !isAuthPage) {
      // Гость пытается зайти не на /login или /register → редирект на /login
      return this.router.createUrlTree(['/login']);
    }

    if (isAuth && isAuthPage) {
      // Авторизованный пытается зайти на /login или /register → редирект на главную
      return this.router.createUrlTree(['/feed']);
    }

    return true;
  }
}
