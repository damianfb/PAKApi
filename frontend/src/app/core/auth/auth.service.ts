import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  loading = signal<boolean>(true);

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initAuth();
  }

  private async initAuth() {
    try {
      const user = await this.supabaseService.getUser();
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      this.loading.set(false);
    }

    // Listen for auth changes
    this.supabaseService.onAuthStateChange((_event: string, session: any) => {
      this.currentUser.set(session?.user ?? null);
      this.isAuthenticated.set(!!session?.user);
    });
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService.signIn(email, password);
      
      if (error) throw error;
      
      this.currentUser.set(data.user);
      this.isAuthenticated.set(true);
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signUp(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService.signUp(email, password);
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await this.supabaseService.signOut();
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const { data } = await this.supabaseService.getSession();
      return data.session?.access_token ?? null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
}
