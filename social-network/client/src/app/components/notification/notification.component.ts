import { Component, inject } from "@angular/core";
import { NotificationService } from "../../services/notification.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (ns.notification()) {
      <div [ngClass]="[
        'notification',
        'notification_' + ns.notification()!.type,
        ns.open() ? 'notification_open' : ''
      ]">
        <span class="notification__text">{{ ns.notification()!.message }}</span>
        <button class="notification__button" (click)="ns.close()">×</button>
      </div>
    }
  `,
  styleUrls: ['./notification.component.css']
})
export class NotifcationComponent {
  ns = inject(NotificationService);
}
