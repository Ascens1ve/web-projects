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
  private _notifications: Notification[] = [];
  private duration = 3000;

  public readonly notification = computed(() => this._notification());
  public readonly open = computed(() => this._open());

  show(message: string, type: Notification['type'] = 'info'): void {
    this._notifications.push({ message, type } as Notification);
    this.next();
  }

  close(): void {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    this._open.set(false);
    setTimeout(() => this.next(), 300);
  }

  next(): void {
    if (this._timer) return;

    const nextNotification = this._notifications.shift();

    if (!nextNotification) return;

    this._notification.set(nextNotification);
    this._open.set(true);

    this._timer = setTimeout(() => this.close(), this.duration);
  }
}
