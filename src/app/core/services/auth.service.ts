import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, Role } from '../models';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private initialized = false;

  constructor() {
    this.initAuthListener();
  }

  private async initAuthListener(): Promise<void> {
    // Check for existing session on startup
    const { data: { session } } = await this.supabaseService.client.auth.getSession();
    if (session?.user) {
      await this.loadProfile(session.user.id, session.user.email ?? '');
    }
    this.initialized = true;

    // Listen for auth changes (login, logout, token refresh)
    this.supabaseService.client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadProfile(session.user.id, session.user.email ?? '');
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
      }
    });
  }

  private async loadProfile(userId: string, email: string): Promise<void> {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('name, role')
      .eq('id', userId)
      .single();

    if (data && !error) {
      const user: User = {
        id: userId,
        email: email,
        name: data.name,
        role: data.role as Role
      };
      this.currentUserSubject.next(user);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<{ error: string | null }> {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      await this.loadProfile(data.user.id, data.user.email ?? '');
    }

    return { error: null };
  }

  async logout(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    this.currentUserSubject.next(null);
  }

  hasRole(role: Role): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }

  async waitForInit(): Promise<void> {
    if (this.initialized) return;
    // Poll until initialized (max 5 seconds)
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.initialized) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 5000);
    });
  }
}
