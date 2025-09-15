import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { PostStore } from "./post.store";
import { firstValueFrom } from "rxjs";

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(
    private apiService: ApiService,
    private postStore: PostStore,
  ) {}

  async loadFeed(nickname: string) {
    if (this.postStore.feedLoadedSig()) return;
    const posts = await firstValueFrom(this.apiService.getFriendsPosts(nickname));
    this.postStore.setList(this.postStore.feedKey, posts);
  }

  async loadUser(nickname: string) {
    const posts = await firstValueFrom(this.apiService.getPersonPosts(nickname));
    this.postStore.setList(this.postStore.userKey(nickname), posts);
  }
}
