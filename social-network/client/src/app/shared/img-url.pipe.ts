import { Pipe, PipeTransform } from '@angular/core';
import { baseUrl } from '../app.constants';

@Pipe({ name: 'imgUrl', standalone: true, pure: true })
export class ImgUrlPipe implements PipeTransform {
  transform(path?: string | null): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;

    const rel = path.startsWith('/') ? path : `/${path}`;
    return new URL(rel, baseUrl).toString();
  }
}
