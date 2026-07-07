import type { Integration, ProfileSettings } from '../types/domain';

// Mock data shaped after the `profiles` Supabase table. Swap for a real
// Supabase read/update once that integration lands.
export function getProfileSettings(): ProfileSettings {
  return {
    fullName: 'Alex Rivera',
    academicLevel: 'Undergraduate',
    bio: 'Computational Biology major focused on neuro-architectures and cognitive science. Lover of structured learning and early morning deep work sessions.',
    mentorStrictness: 50,
    dailyReminders: true,
    pushAlerts: true,
    language: 'English',
  };
}

export function getIntegrations(): Integration[] {
  return [
    { id: 'google', name: 'Google', icon: 'mail', status: 'connected' },
    { id: 'canvas', name: 'Canvas', icon: 'school', status: 'not-linked' },
    { id: 'notion', name: 'Notion', icon: 'inventory_2', status: 'connected' },
  ];
}
