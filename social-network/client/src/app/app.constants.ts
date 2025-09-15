export const ROUTES_CONSTANTS = {
  USERS: { path: 'users', title: 'Люди' },
  FEED: { path: 'feed', title: 'Лента' },
  PROFILE: { path: 'profile', title: 'Профиль' },
  FRIENDS: { path: 'friends', title: 'Друзья' },
  REGISTRATION: { path: 'registration', title: 'Регистрация' },
  LOGIN: { path: 'login', title: 'Логин' },
};

export interface IFriends {
  active: IFriend[];
  outgoing: IFriend[];
  incoming: IFriend[];
}

export interface IUser {
  id: number;
  name: string;
  surname: string;
  nickname: string;
  about: string;
  avatar: string | null;
  friends: IFriends;
  role: 'member' | 'moderator';
  token: string;
};

export interface IUserLogin {
  username: string;
  password: string;
};

export interface IFriend {
  id: number;
  name: string;
  surname: string;
  nickname: string;
  avatar: string;
  about: string;
};

export interface IPosts {
  id: number;
  author: string;
  date: string;
  image: string;
  text: string;
  likes: number[];
};

export interface IProfile {
  id: number;
  name: string;
  surname: string;
  nickname: string;
  avatar: string;
  about: string;
  status: string;
  friends: IFriends;
  friendRelation?: 'active' | 'outgoing' | 'incoming' | null;
};

export interface IEditProfileResponse {
  name: string;
  surname: string;
  about: string;
  avatar: string | null;
}

export interface registrationData {
  nickname: string;
  name: string;
  surname: string;
  birthday: string;
  email: string;
  text?: string;
};

export interface IRelationUpdate {
  type: 'success' | 'error';
  message: string;
  id: number;
  relation: 'active' | 'outgoing' | 'incoming' | null;
}

export type FriendsActions = 'add-to' | 'add-from' | 'delete-to' | 'delete-from' | 'accept' | 'decline-to' | 'decline-from';
export type FriendsTypes = 'active' | 'outgoing' | 'incoming';

export const baseUrl = 'https://localhost:3000';
export const expressUrl = 'https://localhost:3000/api';

// Константы для валидации
export const requiredError = 'Заполните это поле';

export const minNicknameLength = 6;
export const maxNicknameLength = 32;
export const nicknameError = `От ${minNicknameLength} до ${maxNicknameLength} символов`;

export const minPasswordLength = 8;
export const maxPasswordLength = 32;
export const passwordError = `От ${minPasswordLength} до ${maxPasswordLength} символов`;

export const minNameSurnameLength = 1;
export const maxNameSurnameLength = 64;
export const nameSurnameError = `От ${minNameSurnameLength} до ${maxNameSurnameLength} символов`;

export const emailError = 'Введите корректный адрес';

export const futurePastDateError = 'Укажите корректную дату';
export const tooYoungError = 'Вы должны быть старше 13 лет';