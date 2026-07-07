import { supabase } from '../lib/supabaseClient';
import { apiClient } from '../lib/apiClient';
import type { Integration, ProfileSettings } from '../types/domain';

interface ProfileRow {
  full_name: string | null;
  avatar_url: string | null;
  academic_level: string | null;
  bio: string | null;
  plan: string;
  mentor_personality: number;
  daily_study_reminders: boolean;
  push_alerts: boolean;
  language: string;
  current_streak_days: number;
}

function fromRow(row: ProfileRow): ProfileSettings {
  return {
    fullName: row.full_name ?? '',
    avatarUrl: row.avatar_url,
    academicLevel: row.academic_level ?? 'undergraduate',
    bio: row.bio ?? '',
    plan: row.plan,
    mentorStrictness: row.mentor_personality,
    dailyReminders: row.daily_study_reminders,
    pushAlerts: row.push_alerts,
    language: row.language,
    currentStreakDays: row.current_streak_days,
  };
}

export async function getProfile(userId: string): Promise<ProfileSettings> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'full_name, avatar_url, academic_level, bio, plan, mentor_personality, daily_study_reminders, push_alerts, language, current_streak_days',
    )
    .eq('id', userId)
    .single();
  if (error) throw error;
  return fromRow(data as ProfileRow);
}

export interface ProfileUpdate {
  fullName: string;
  academicLevel: string;
  bio: string;
  mentorStrictness: number;
  dailyReminders: boolean;
  pushAlerts: boolean;
  language: string;
}

export async function updateProfile(userId: string, update: ProfileUpdate): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: update.fullName,
      academic_level: update.academicLevel,
      bio: update.bio,
      mentor_personality: update.mentorStrictness,
      daily_study_reminders: update.dailyReminders,
      push_alerts: update.pushAlerts,
      language: update.language,
    })
    .eq('id', userId);
  if (error) throw error;
}

// Best-effort: the "avatars" storage bucket may not exist yet in a fresh
// Supabase project. Callers should catch and toast, not treat this as fatal.
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
  if (updateError) throw updateError;

  return publicUrl;
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/auth/me');
}

// No backing table or OAuth app registrations exist for these yet — real
// third-party account linking is out of scope; surfaced as "Coming Soon".
export function getIntegrations(): Integration[] {
  return [
    { id: 'google', name: 'Google', icon: 'mail' },
    { id: 'canvas', name: 'Canvas', icon: 'school' },
    { id: 'notion', name: 'Notion', icon: 'inventory_2' },
  ];
}
