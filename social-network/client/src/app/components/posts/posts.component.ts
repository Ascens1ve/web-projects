import { Component, Input } from '@angular/core';
import { PostComponent } from '../post/post.component';
import { IPosts } from '../../app.constants';

@Component({
  selector: 'posts',
  imports: [PostComponent],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
  standalone: true
})
export class PostsComponent {
  @Input() postList: IPosts[] = [];
}
