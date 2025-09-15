import { Component, OnDestroy, OnInit, Signal } from '@angular/core';
import { PostsComponent } from '../../components/posts/posts.component';
import { IFriends, IPosts } from '../../app.constants';
import { UserService } from '../../services/user.service';
import { PostStore } from '../../services/post.store';
import { PostService } from '../../services/post.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-feed-page',
  imports: [PostsComponent],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.css'
})
export class FeedPageComponent implements OnInit, OnDestroy {
  postsSig!: Signal<IPosts[]>;

  constructor(
    private readonly postStore: PostStore,
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly socketService: SocketService,
  ) {}

  async ngOnInit() {
    this.postsSig = this.postStore.listSig(this.postStore.feedKey);
    await this.postService.loadFeed(this.userService.currentUser?.nickname || '');
    const friends: IFriends = this.userService.friends;
    for (const key in friends) {
      for (const friend of friends[key as keyof IFriends]) {
        this.socketService.joinRoom(`feed/${friend.nickname}`);
      }
    }
  }

  ngOnDestroy(): void {
    const friends: IFriends = this.userService.friends;
    for (const key in friends) {
      for (const friend of friends[key as keyof IFriends]) {
        this.socketService.leaveRoom(`feed/${friend.nickname}`);
      }
    }
  }
}
