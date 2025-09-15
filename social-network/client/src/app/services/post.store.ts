import { computed, Injectable, Signal, signal } from "@angular/core";
import { IPosts } from "../app.constants";

export type ListKey = 'feed' | `user:${string}`;

@Injectable({ providedIn: 'root' })
export class PostStore {
  private mapSig = signal<Record<number, IPosts>>({});
  private listsSig = signal<Record<ListKey, number[]>>({ feed: [] });

  userKey = (nickname: string): ListKey => `user:${nickname}`;
  feedKey: ListKey = 'feed';
  feedLoadedSig = signal<boolean>(false);

  //- Селекторы
  listSig = (key: ListKey): Signal<IPosts[]> =>
    computed(() => {
      const map = this.mapSig();
      const ids = this.listsSig()[key] ?? [];
      return ids.map(id => map[id]).filter(Boolean).reverse();
    });

  //- Мутации
  // Вставка/изменение поста
  upsert(post: IPosts) {
    this.mapSig.update(m => ({...m, [post.id]: post}));
  }

  setList(key: ListKey, posts: IPosts[]) {
    const ids = posts.map(p => p.id);
    this.mapSig.update(m => {
      const next = {...m};
      for (const p of posts) next[p.id] = p;
      return next;
    });
    this.listsSig.update(l => ({ ...l, [key]: ids }));
    if (key === 'feed') this.feedLoadedSig.set(true);
  }

  prependToList(key: ListKey, post: IPosts) {
    this.upsert(post);
    this.listsSig.update(l => {
      const curr: number[] = l[key] ?? [];
      // без дублей
      const next: number[] = curr[0] === post.id ? curr : [...curr.filter(id => id !== post.id), post.id];
      return { ...l, [key]: next };
    });
  }

  // Добавить/обновить во все списки --- без изменения списков
  updateInLists(post: IPosts) {
    this.upsert(post);
  }

  removeEverywhere(postID: number) {
    this.mapSig.update(m => {
      const { [postID]: _, ...rest } = m;
      return rest;
    });
    this.listsSig.update(l => {
      const next: Record<ListKey, number[]> = {} as any;
      for (const k of Object.keys(l) as ListKey[]) {
        next[k] = (l[k] ?? []).filter(id => id !== postID);
      }
      return next;
    });
  }

  setLikes(postId: number, likes: number[]) {
    this.mapSig.update(m => {
      const p = m[postId];
      if (!p) return m;
      return { ...m, [postId]: { ...p, likes } };
    });
  }
}
