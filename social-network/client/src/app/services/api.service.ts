import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IFriend, expressUrl, IProfile, IPosts, FriendsTypes, IUser, IEditProfileResponse } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  getMe(token?: string) {
    return this.http.post<string>(`${expressUrl}/me`, { token } );
  }

  getPersonPosts(nickname: string) {
    return this.http.get<IPosts[]>(`${expressUrl}/posts/${nickname}`);
  }

  getFriendsPosts(nickname: string) {
    return this.http.get<IPosts[]>(`${expressUrl}/posts/${nickname}/friends`);
  }

  getPersonInfo(nickname: string) {
    return this.http.get<IProfile>(`${expressUrl}/profile/${nickname}`);
  }

  getFriends(nickname: string) {
    return this.http.get<Record<FriendsTypes, IFriend[]>>(`${expressUrl}/friends/${nickname}`);
  }

  getUsers() {
    return this.http.get<IProfile[]>(`${expressUrl}/people`);
  }

  removeFriend(userNickname: string, friendId: number) {
    return this.http.delete(`${expressUrl}/friends/${userNickname}/delete/${friendId}`);
  }

  addFriend(userNickname: string, friendId: number) {
    return this.http.post(`${expressUrl}/friends/${userNickname}/add/${friendId}`, null);
  }

  putLike(postId: number, userNickname: string) {
    return this.http.put<number[]>(`${expressUrl}/posts/${postId}/like/${userNickname}`, null);
  }

  postEditProfile(formData: FormData) {
    return this.http.post<IEditProfileResponse>(`${expressUrl}/edit-profile`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  }

  postNewPost(formData: FormData) {
    return this.http.post<IPosts>(`${expressUrl}/new-post`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  }

  deleteAvatar() {
    return this.http.put<IUser>(`${expressUrl}/delete-avatar`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  }
}
