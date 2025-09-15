import { computed, Injectable, signal } from "@angular/core";

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  type: NotificationType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notification = signal<Notification | null>(null);
  private _open = signal<boolean>(false);
  private _timer: any = null;

  public readonly notification = computed(() => this._notification());
  public readonly open = computed(() => this._open());

  show(message: string, type: Notification['type'] = 'info', duration: number = 3000) {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    this._notification.set({ message, type });
    this._open.set(true);

    this._timer = setTimeout(() => this.close(), duration);
  }
  
  close() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    this._open.set(false);
  }
}
