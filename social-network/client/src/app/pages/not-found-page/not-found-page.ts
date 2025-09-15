import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <h1>404</h1>
      <p>Страница не найдена</p>
      <a routerLink="/feed">Вернуться на главную</a>
    </div>
  `,
  styleUrl: './not-found-page.css'
})
export class NotFoundPageComponent {}
