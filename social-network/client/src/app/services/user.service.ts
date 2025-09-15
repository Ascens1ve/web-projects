import { Injectable, signal } from "@angular/core";
import { IFriends, IUser } from "../app.constants";
import { JwtHelperService } from "@auth0/angular-jwt";
import { ApiService } from "./api.service";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSig = signal<IUser | null>(null);
  helper: JwtHelperService;

  constructor(
    private apiService: ApiService
  ) {
    this.helper = new JwtHelperService();
  }

  set currentUser(user: IUser | null) {
    this.currentUserSig.set(user);
  }

  get currentUser() {
    return this.currentUserSig();
  }

  get nickname(): string | null {
    return this.currentUserSig()?.nickname ?? null;
  }

  get friends(): IFriends {
    return this.currentUserSig()?.friends ?? { active: [], outgoing: [], incoming: [] };
  }

  updateFriends(event: any) {
    this.currentUserSig.update(u => {
      if (!u) return u;
      const friends = {
        ...u.friends,
        active:  [...u.friends.active],
        incoming:[...u.friends.incoming],
        outgoing:[...u.friends.outgoing],
      };

      switch (event.action) {
        case 'add-to': friends.outgoing.push(event.friend); break;
        case 'add-from': friends.incoming.push(event.friend); break;
        case 'accept-to':
          friends.incoming = friends.incoming.filter(f => f.id !== event.friend.id);
          friends.active.push(event.friend);
          break;
        case 'accept-from':
          friends.outgoing = friends.outgoing.filter(f => f.id !== event.friend.id);
          friends.active.push(event.friend);
          break;
        case 'delete-to':
          friends.active = friends.active.filter(f => f.id !== event.friend.id);
          friends.incoming.push(event.friend);
          break;
        case 'delete-from':
          friends.active = friends.active.filter(f => f.id !== event.friend.id);
          friends.outgoing.push(event.friend);
          break;
        case 'decline-to':
          friends.incoming = friends.incoming.filter(f => f.id !== event.friend.id);
          break;
        case 'decline-from':
          friends.outgoing = friends.outgoing.filter(f => f.id !== event.friend.id);
          break;
      }

      return { ...u, friends};
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const exp = this.helper.isTokenExpired(localStorage.getItem('authToken'));
    if (!exp && this.currentUser) return true;
    if (!exp) {
      try {
        const user = await firstValueFrom(this.apiService.getMe(localStorage.getItem('authToken') ?? undefined));
        console.log(user);
        if (!user) return false;
        this.currentUser = JSON.parse(user);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
