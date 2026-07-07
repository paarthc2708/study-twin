import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { Toggle } from '../components/ui/Toggle';
import { useAuth } from '../context/AuthContext';
import { getIntegrations, getProfileSettings } from '../services/settingsService';

function strictnessLabel(value: number): string {
  if (value < 33) return 'Encouraging';
  if (value < 66) return 'Balanced';
  return 'Strict';
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [profile] = useState(() => getProfileSettings());
  const [integrations] = useState(() => getIntegrations());

  const [fullName, setFullName] = useState(profile.fullName);
  const [academicLevel, setAcademicLevel] = useState(profile.academicLevel);
  const [bio, setBio] = useState(profile.bio);
  const [mentorStrictness, setMentorStrictness] = useState(profile.mentorStrictness);
  const [dailyReminders, setDailyReminders] = useState(profile.dailyReminders);
  const [pushAlerts, setPushAlerts] = useState(profile.pushAlerts);
  const [language, setLanguage] = useState(profile.language);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      navigate('/sign-in');
    }
  }

  return (
    <>
      <div>
        <h2 className="font-display-lg text-display-lg text-on-surface mb-xs">Profile & Settings</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Manage your account preferences and customize your AI mentor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        <section className="md:col-span-8 space-y-lg">
          <GlassCard className="p-lg">
            <h3 className="font-headline-md text-headline-md mb-lg">Personal Information</h3>
            <div className="flex flex-col md:flex-row gap-xl items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/50 shadow-lg bg-primary-container flex items-center justify-center">
                  <MaterialIcon name="person" className="text-on-primary-container" style={{ fontSize: '48px' }} />
                </div>
                <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                  <MaterialIcon name="photo_camera" className="text-sm" />
                </button>
              </div>
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-sm text-label-sm text-outline">Full Name</label>
                  <input
                    className="w-full px-md py-sm bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-sm text-label-sm text-outline">Academic Level</label>
                  <select
                    className="w-full px-md py-sm bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    value={academicLevel}
                    onChange={(event) => setAcademicLevel(event.target.value)}
                  >
                    <option>Undergraduate</option>
                    <option>Graduate</option>
                    <option>PhD Candidate</option>
                    <option>Lifelong Learner</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-xs">
                  <label className="font-label-sm text-label-sm text-outline">Bio</label>
                  <textarea
                    className="w-full px-md py-sm bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    rows={3}
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-lg">
            <div className="flex items-center gap-sm mb-lg">
              <MaterialIcon name="auto_awesome" className="text-primary" />
              <h3 className="font-headline-md text-headline-md">AI Twin Preferences</h3>
            </div>
            <div className="space-y-xl">
              <div>
                <div className="flex justify-between mb-sm">
                  <label className="font-body-md font-semibold">Mentor Personality</label>
                  <span className="text-primary font-label-sm">{strictnessLabel(mentorStrictness)}</span>
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-xs text-outline font-label-sm">Encouraging</span>
                  <input
                    className="flex-1 h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                    max={100}
                    min={0}
                    type="range"
                    value={mentorStrictness}
                    onChange={(event) => setMentorStrictness(Number(event.target.value))}
                  />
                  <span className="text-xs text-outline font-label-sm">Strict</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-sm">
                  Determines how direct and rigorous the AI feedback will be during quiz sessions.
                </p>
              </div>
              <div className="flex items-center justify-between p-md bg-primary/5 rounded-xl border border-primary/10">
                <div>
                  <h4 className="font-body-md font-semibold">Daily Study Reminders</h4>
                  <p className="text-sm text-on-surface-variant">Receive personalized nudges from your Twin.</p>
                </div>
                <Toggle checked={dailyReminders} onChange={setDailyReminders} label="Daily study reminders" />
              </div>
            </div>
          </GlassCard>
        </section>

        <aside className="md:col-span-4 space-y-lg">
          <GlassCard className="p-lg">
            <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-md">General</h3>
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <MaterialIcon name="dark_mode" className="text-on-surface-variant" />
                  <span className="text-on-surface">Dark Mode</span>
                </div>
                <span className="text-xs font-label-sm px-sm py-unit bg-secondary-container text-secondary rounded">
                  Coming Soon
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <MaterialIcon name="language" className="text-on-surface-variant" />
                  <span className="text-on-surface">Language</span>
                </div>
                <select
                  className="text-sm bg-transparent border-none font-semibold text-primary outline-none text-right"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>Mandarin</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <MaterialIcon name="notifications_active" className="text-on-surface-variant" />
                  <span className="text-on-surface">Push Alerts</span>
                </div>
                <Toggle checked={pushAlerts} onChange={setPushAlerts} label="Push alerts" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-lg">
            <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-md">Integrations</h3>
            <div className="space-y-md">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-sm hover:bg-surface-container rounded-lg transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-md">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm border border-outline-variant">
                      <MaterialIcon
                        name={integration.icon}
                        className={`text-lg ${integration.id === 'google' ? 'text-red-500' : 'text-on-surface'}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{integration.name}</p>
                      <p className={`text-[10px] ${integration.status === 'connected' ? 'text-primary' : 'text-outline'}`}>
                        {integration.status === 'connected' ? 'Connected' : 'Not Linked'}
                      </p>
                    </div>
                  </div>
                  <MaterialIcon
                    name={integration.status === 'connected' ? 'check_circle' : 'add'}
                    className="text-outline group-hover:text-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-lg border-error/10">
            <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-md">Account Actions</h3>
            <div className="space-y-sm">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full py-sm px-md rounded-lg text-sm font-semibold text-error hover:bg-error-container/50 transition-colors flex items-center gap-md disabled:opacity-50"
              >
                <MaterialIcon name="logout" className="text-lg" />
                {isLoggingOut ? 'Logging out…' : 'Log out'}
              </button>
              <button
                disabled
                className="w-full py-sm px-md rounded-lg text-sm font-semibold text-outline-variant flex items-center gap-md opacity-50 cursor-not-allowed"
              >
                <MaterialIcon name="delete_forever" className="text-lg" />
                Delete Account
              </button>
            </div>
          </GlassCard>
        </aside>
      </div>
    </>
  );
}
