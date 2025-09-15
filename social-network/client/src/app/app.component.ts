import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { NotifcationComponent } from "./components/notification/notification.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent, NotifcationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'social-network-main';
}
