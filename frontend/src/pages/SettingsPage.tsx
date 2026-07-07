import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { Toggle } from '../components/ui/Toggle';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/ToastProvider';
import { useAuth } from '../context/AuthContext';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { deleteAccount, getIntegrations, getProfile, updateProfile, uploadAvatar } from '../services/settingsService';

function strictnessLabel(value: number): string {
  if (value < 33) return 'Encouraging';
  if (value < 66) return 'Balanced';
  return 'Strict';
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(() => getProfile(user!.id), [user]);
  const { data: profile, loading, error, refetch } = useSupabaseQuery(loadProfile, [user?.id]);
  const [integrations] = useState(() => getIntegrations());

  const [fullName, setFullName] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [bio, setBio] = useState('');
  const [mentorStrictness, setMentorStrictness] = useState(50);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [language, setLanguage] = useState('English');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName);
    setAcademicLevel(profile.academicLevel);
    setBio(profile.bio);
    setMentorStrictness(profile.mentorStrictness);
    setDailyReminders(profile.dailyReminders);
    setPushAlerts(profile.pushAlerts);
    setLanguage(profile.language);
    setAvatarUrl(profile.avatarUrl);
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user.id, { fullName, academicLevel, bio, mentorStrictness, dailyReminders, pushAlerts, language });
      showToast('Settings saved.', 'success');
    } catch (err) {
      showToast(errorMessage(err, 'Could not save settings.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingAvatar(true);
    try {
      const url = await uploadAvatar(user.id, file);
      setAvatarUrl(url);
      showToast('Profile photo updated.', 'success');
    } catch (err) {
      showToast(errorMessage(err, 'Could not upload photo — storage may not be configured yet.'));
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      navigate('/sign-in');
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await signOut();
      navigate('/');
    } catch (err) {
      showToast(errorMessage(err, 'Could not delete account.'));
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <div className="text-on-surface-variant">Loading settings…</div>;
  }

  if (error) {
    return (
      <div className="text-center py-2xl space-y-md">
        <p className="text-error">{error}</p>
        <button onClick={refetch} className="text-primary font-bold hover:underline">
          Try again
        </button>
      </div>
    );
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
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <MaterialIcon name="person" className="text-on-primary-container" style={{ fontSize: '48px' }} />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <MaterialIcon name="photo_camera" className="text-sm" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
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
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="phd_candidate">PhD Candidate</option>
                    <option value="lifelong_learner">Lifelong Learner</option>
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

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-xl py-md bg-primary text-on-primary rounded-xl font-label-sm font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
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
                <div key={integration.id} className="flex items-center justify-between p-sm rounded-lg opacity-60">
                  <div className="flex items-center gap-md">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm border border-outline-variant">
                      <MaterialIcon name={integration.icon} className="text-lg text-on-surface" />
                    </div>
                    <p className="text-sm font-semibold">{integration.name}</p>
                  </div>
                  <span className="text-xs font-label-sm px-sm py-unit bg-secondary-container text-secondary rounded">
                    Coming Soon
                  </span>
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
                onClick={() => setDeleteModalOpen(true)}
                className="w-full py-sm px-md rounded-lg text-sm font-semibold text-outline-variant hover:text-error transition-colors flex items-center gap-md"
              >
                <MaterialIcon name="delete_forever" className="text-lg" />
                Delete Account
              </button>
            </div>
          </GlassCard>
        </aside>
      </div>

      <Modal open={deleteModalOpen} title="Delete your account?" onClose={() => setDeleteModalOpen(false)}>
        <div className="space-y-md">
          <p className="text-on-surface-variant">
            This permanently deletes your account and every course, quiz, chat session, and study record associated
            with it. This cannot be undone.
          </p>
          <div className="flex gap-sm">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 py-sm rounded-lg border border-outline-variant font-bold hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 py-sm rounded-lg bg-error text-on-error font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isDeleting ? 'Deleting…' : 'Delete Forever'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
