import { Injectable, inject, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Community, NewCommunity } from '../models/record.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class CommunitiesService {
  private readonly supabase = inject(SupabaseService);
  readonly communities = signal<Community[]>([]);
  readonly realtimeError = signal('');
  readonly realtimeConnected = signal(false);
  private channel?: RealtimeChannel;

  async load(): Promise<void> {
    const client = await this.supabase.getClient();
    const { data, error } = await client
      .from('comunidad')
      .select('id, created_at, comunidad, numero, email, coste_mensual, junta, cancelada')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    this.communities.set(data as Community[]);
    await this.subscribeToChanges();
  }

  async create(community: NewCommunity): Promise<void> {
    const client = await this.supabase.getClient();
    const { error } = await client.from('comunidad').insert(community);
    if (error) {
      throw error;
    }
    await this.load();
  }

  async update(id: number, community: NewCommunity): Promise<void> {
    const client = await this.supabase.getClient();
    const { error } = await client.from('comunidad').update(community).eq('id', id);
    if (error) {
      throw error;
    }
    await this.load();
  }

  async remove(id: number): Promise<void> {
    const client = await this.supabase.getClient();
    const { error } = await client.from('comunidad').delete().eq('id', id);
    if (error) {
      throw error;
    }
    await this.load();
  }

  async emailExists(email: string, excludeId: number | null): Promise<boolean> {
    const client = await this.supabase.getClient();
    let query = client.from('comunidad').select('id').ilike('email', email);
    if (excludeId !== null) {
      query = query.neq('id', excludeId);
    }
    const { data, error } = await query.limit(1);
    if (error) {
      throw error;
    }
    return data.length > 0;
  }

  private async subscribeToChanges(): Promise<void> {
    if (this.channel) {
      return;
    }
    const client = await this.supabase.getClient();
    this.channel = client
      .channel('comunidad-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comunidad' }, () => {
        void this.load().catch((error: unknown) => {
          this.realtimeError.set(
            error instanceof Error ? error.message : 'No se pudieron actualizar las comunidades.',
          );
        });
      })
      .subscribe((status, error) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.realtimeConnected.set(false);
          this.realtimeError.set(
            error?.message ?? 'No se pudo establecer la conexión en tiempo real.',
          );
        } else if (status === 'SUBSCRIBED') {
          this.realtimeConnected.set(true);
          this.realtimeError.set('');
        } else if (status === 'CLOSED') {
          this.realtimeConnected.set(false);
        }
      });
  }
}
