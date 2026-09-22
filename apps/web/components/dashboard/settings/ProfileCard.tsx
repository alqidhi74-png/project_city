'use client';

import { useEffect, useRef, useState } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import { useSettings } from '../state/SettingsProvider';
import { Card, CardHeader } from '../ui/Card';
import { CheckIcon, UserIcon } from '../ui/Icons';

export function ProfileCard() {
  const { dict } = useDashboard();
  const { profile, updateProfile } = useSettings();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const dirty = draft.name !== profile.name || draft.email !== profile.email;

  function handleSave() {
    updateProfile({ ...profile, name: draft.name.trim() || profile.name, email: draft.email.trim() || profile.email });
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 2200);
  }

  const inputClass =
    'w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-xs text-ink outline-none transition-colors focus:border-city-emerald';

  return (
    <Card>
      <CardHeader title={dict.settingsPage.profile.title} />

      <div className="flex items-center gap-3">
        <span className="bg-gold-gradient grid size-12 shrink-0 place-items-center rounded-full text-city-emerald">
          <UserIcon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{profile.name}</p>
          <p className="truncate text-[11px] text-ink-subtle">{profile.role}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-[11px] text-ink-subtle">{dict.settingsPage.profile.name}</span>
          <input
            type="text"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-ink-subtle">{dict.settingsPage.profile.email}</span>
          <input
            type="email"
            value={draft.email}
            onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!dirty}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-city-emerald py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {saved ? <CheckIcon className="size-4" /> : null}
        {saved ? dict.settingsPage.profile.saved : dict.settingsPage.profile.save}
      </button>
    </Card>
  );
}
