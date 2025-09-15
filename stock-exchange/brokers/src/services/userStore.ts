import type { ILogin } from '@/interfaces';
import { fetchBroker, loginBroker } from './api';
import { defineStore } from 'pinia';

interface UserState {
  user: {
    alias: string | null;
    surname: string | null;
    name: string | null;
    role: 'admin' | 'broker' | null;
    baseMoney: number;
  };
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  error: string;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: {
      alias: null,
      surname: null,
      name: null,
      role: null,
      baseMoney: 0,
    },
    isAuthChecked: false,
    isAuthenticated: false,
    error: '',
  }),
  actions: {
    async login(alias: string, password: string) {
      try {
        const response: ILogin = await loginBroker(alias, password);
        this.user.alias = response.alias;
        this.user.name = response.name;
        this.user.surname = response.surname;
        this.user.baseMoney = response.baseMoney;
        this.user.role = response.role;
        this.isAuthenticated = true;
        localStorage.setItem('accessToken', response.token);
      } catch (error) {
        this.isAuthenticated = false;
        this.error = (error as Error).message;
      } finally {
        this.isAuthChecked = true;
      }
    },
    async checkAuth() {
      try {
        const broker = await fetchBroker();
        this.user.alias = broker.alias;
        this.user.name = broker.name;
        this.user.surname = broker.surname;
        this.user.baseMoney = broker.baseMoney;
        this.user.role = broker.role;
        this.isAuthenticated = true;
        this.isAuthChecked = true;
        this.error = '';
      } catch (error) {
        this.isAuthChecked = true;
        this.isAuthenticated = false;
        this.error = (error as Error).message;
      }
    },
    logout() {
      this.user.alias = null;
      this.user.name = null;
      this.user.surname = null;
      this.user.role = null;
      this.user.baseMoney = 0;
      this.isAuthChecked = true;
      this.isAuthenticated = false;
      localStorage.removeItem('accessToken');
    },
    isAdmin(): boolean {
      return this.user.role === 'admin';
    },
    clearError(): void {
      this.error = '';
    },
  },
});
