import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, Role } from '../models';
import { MOCK_USERS } from '../mock-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load from local storage for persistence across reloads
    const storedUserId = localStorage.getItem('procon_user_id');
    if (storedUserId) {
      const user = MOCK_USERS.find(u => u.id === storedUserId);
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getUsers(): User[] {
    return MOCK_USERS;
  }

  login(userId: string): void {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      localStorage.setItem('procon_user_id', user.id);
      this.currentUserSubject.next(user);
    }
  }

  logout(): void {
    localStorage.removeItem('procon_user_id');
    this.currentUserSubject.next(null);
  }

  hasRole(role: Role): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }
}
