import { Component, OnDestroy, OnInit, Signal, inject } from '@angular/core';
import { PostsComponent } from '../../components/posts/posts.component';
import { ApiService } from '../../services/api.service';
import { baseUrl, IEditProfileResponse, IPosts, IProfile } from '../../app.constants';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditProfileComponent } from '../../components/dialog-edit-profile/dialog-edit-profile.component';
import { SocketService } from '../../services/socket.service';
import { DialogCreatePostComponent } from '../../components/dialog-create-post/dialog-create-post.component';
import { ImgUrlPipe } from '../../shared/img-url.pipe';
import { PostStore } from '../../services/post.store';
import { PostService } from '../../services/post.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile-page',
  imports: [PostsComponent, ImgUrlPipe, MatButtonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  profileNickname: string = '';
  profileInfo: IProfile | undefined = undefined;
  postsSig!: Signal<IPosts[]>;
  userNickname: string = '';
  readonly dialog = inject(MatDialog);

  constructor(
    private readonly api: ApiService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly postStore: PostStore,
    private readonly postService: PostService,
    private readonly socketService: SocketService,
  ) {
    const currentUser = this.userService.currentUser;
    if (currentUser) this.userNickname = currentUser.nickname;
  }

  async ngOnInit() {
    this.profileNickname = this.route.snapshot.paramMap.get('nickname') || '';
    this.postsSig = this.postStore.listSig(`user:${this.profileNickname}`);
    await this.postService.loadUser(this.profileNickname);
    this.route.paramMap.subscribe((params) => { this.getProfileInfo(); });
    this.socketService.joinRoom(`profile/${this.profileNickname}`);
    this.socketService.onUpdateProfile((data: IEditProfileResponse) => this.updateProfile(data));
  }

  ngOnDestroy(): void {
    this.socketService.leaveRoom(`profile/${this.profileNickname}`);
  }

  getProfileInfo() {
    this.api.getPersonInfo(this.profileNickname).subscribe({
      next: (profileInfo: IProfile) => this.profileInfo = profileInfo,
      error: (error) => console.error(error),
    });
  }

  openDialogEditProfile() {
    const dialogRef = this.dialog.open(DialogEditProfileComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result - ${result}`);
    })
  }

  openDialogCreatePost() {
    const dialogRef = this.dialog.open(DialogCreatePostComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result - ${result}`);
    })
  }

  updateProfile(data: IEditProfileResponse) {
    if (!this.profileInfo) return;
    this.profileInfo.name = data.name;
    this.profileInfo.surname = data.surname;
    this.profileInfo.about = data.about;
    this.profileInfo.avatar = data.avatar ? `${baseUrl}/${data.avatar}` : '';
  }
}
