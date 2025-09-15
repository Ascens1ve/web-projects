import { Component, Input } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/user.service';
import { ImgUrlPipe } from '../../shared/img-url.pipe';

@Component({
  selector: 'post',
  imports: [ImgUrlPipe],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent {
  @Input() author: string | undefined;
  @Input() avatar_src: string | undefined;
  @Input() date: string | undefined;
  @Input() likes: number[] = [];
  @Input() image_src: string | undefined;
  @Input() text: string | undefined;
  @Input() id: number = -1;

  like_imgs: string[] = ['assets/images/svg/like_inactive.svg', 'assets/images/svg/like_active.svg']
  like_type: number = 0;

  constructor(
    private userService: UserService,
    private socketService: SocketService,
  ) { }

  putLike(postId: number) {
    this.socketService.emit('likes', postId);
  }

  likedByMe() {
    const user = this.userService.currentUser;
    return user ? new Set(this.likes).has(user.id) : false;
  }
}
