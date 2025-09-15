import { Injectable } from '@angular/core';
import { IUser, IUserLogin, expressUrl, registrationData } from '../app.constants';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private socketService: SocketService
  ) {
    this.init();
  }

  async init() {
    if (await this.userService.isAuthenticated()) {
      this.socketService.connect();
      this.socketService.joinRoom(this.userService.currentUser!.nickname);
    }
  }

  login(userData: IUserLogin) {
    return this.http.post<IUser>(`${expressUrl}/login`, userData);
  }

  registration(data: registrationData) {
    return this.http.post<IUser>(`${expressUrl}/registration`, data);
  }

  logout(): void {
    localStorage.setItem('user', JSON.stringify(null));
    localStorage.removeItem('authToken');
    this.userService.currentUser = null;
    this.router.navigateByUrl('/login');
  }
}
