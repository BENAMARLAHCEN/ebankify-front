import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserId(): string | null {
    return localStorage.getItem('currentUser');
  }
}