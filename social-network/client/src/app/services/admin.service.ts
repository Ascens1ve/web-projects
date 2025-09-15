import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private expressUrl = 'https://localhost:3000/';

  constructor(private http: HttpClient) { }

  getMain() {
    return this.http.get(`${this.expressUrl}`, { responseType: 'text' });
  }
}
