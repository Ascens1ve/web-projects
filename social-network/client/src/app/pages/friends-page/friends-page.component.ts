import { Component, computed, Signal } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/user.service';
import { IFriends } from '../../app.constants';
import { ImgUrlPipe } from '../../shared/img-url.pipe';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-friends-page',
  imports: [ImgUrlPipe, MatButtonModule, RouterLink],
  templateUrl: './friends-page.component.html',
  styleUrl: './friends-page.component.css'
})
export class FriendsPageComponent {
  friendsSig: Signal<IFriends> = computed(() => this.userService.friends);
  selectedCategory: 'active' | 'outgoing' | 'incoming' = 'active';

  constructor(
    private readonly userService: UserService,
    private readonly socketService: SocketService,
  ) {}

  removeFriend(friendId: number) {
    this.socketService.emit('friend-delete', friendId);
  }

  acceptFriend(friendId: number) {
    this.socketService.emit('friend-accept', friendId);
  }

  declineFriend(friendId: number, type: 'outgoing' | 'incoming') {
    this.socketService.emit('friend-decline', { friendId, type });
  }
}
