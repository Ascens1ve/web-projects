import { Component, computed, Signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { baseUrl, ROUTES_CONSTANTS } from '../../app.constants';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  nickname: Signal<string | undefined>;
  role: Signal<'member' | 'moderator' | undefined> =
    computed(() => this.userService.currentUser?.role);
  adminUrl = baseUrl;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {
    this.nickname = computed(() => this.userService.currentUser?.nickname);
  }

  links = [
    [ROUTES_CONSTANTS.FEED.path, ROUTES_CONSTANTS.FEED.title],
    [ROUTES_CONSTANTS.FRIENDS.path, ROUTES_CONSTANTS.FRIENDS.title],
    [ROUTES_CONSTANTS.PROFILE.path, ROUTES_CONSTANTS.PROFILE.title],
    [ROUTES_CONSTANTS.USERS.path, ROUTES_CONSTANTS.USERS.title],
  ];

  isActive(route: string): boolean {
    return this.router.url.startsWith('/' + route);
  }

  toLogin(): void {
    this.router.navigateByUrl('/login');
  }

  logout(): void {
    this.authService.logout();
  }
}
