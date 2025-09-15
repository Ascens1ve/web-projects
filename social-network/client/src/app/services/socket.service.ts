import { Injectable, NgZone, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { baseUrl, FriendsActions, IEditProfileResponse, IFriend, IPosts, IRelationUpdate } from '../app.constants';
import { UserService } from './user.service';
import { NotificationService, Notification } from './notification.service';
import { ListKey, PostStore } from './post.store';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;

  constructor(
    private userService: UserService,
    private ngZone: NgZone,
    private postStore: PostStore,
    private readonly notificationService: NotificationService,
  ) {
    this.socket = io(baseUrl, {
      auth: { token: localStorage.getItem('authToken') },
      autoConnect: false
    });
    this.initListeners();
  }

  private initListeners(): void {
    this.socket.on('connect', () => {
      if (this.userService.currentUser) {
        this.joinRoom(this.userService.currentUser.nickname);
      }
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('requestFriendship', (data: {message: string, type: Notification['type'], action: FriendsActions, friend: IFriend }) => {
      this.ngZone.run(() => {
        this.notificationService.show(data.message, data.type);
        this.userService.updateFriends(data);
      });
    });

    this.socket.on('post/add', (data: { post: IPosts, listKey: ListKey }) => {
      this.ngZone.run(() => {
        this.notificationService.show('Лента обновлена', 'success');
        this.postStore.prependToList(data.listKey, data.post)
      });
    });

    this.socket.on('likes', (data: { postId: number, likes: number[] }) => {
      this.ngZone.run(() => {
        this.postStore.setLikes(data.postId, data.likes);
      });
    });
  }

  connect(token?: string): void {
    this.socket.auth = { token: token ?? localStorage.getItem('authToken') };
    this.socket.connect();
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  joinRoom(roomName: string) {
    this.emit('joinRoom', roomName);
  }

  leaveRoom(roomName: string) {
    this.emit('leaveRoom', roomName);
  }

  onUpdateProfile(callback: (data: IEditProfileResponse) => void) {
    this.socket.on('update/profile', callback);
  }

  onUpdateRelation(callback: (data: IRelationUpdate) => void) {
    this.socket.on('update/people', callback);
  }
}
