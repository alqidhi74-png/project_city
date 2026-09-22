'use client';

import { useDict } from '../state/DashboardProvider';
import { useStory } from '../state/StoryProvider';
import { StoryIcon } from '../ui/Icons';

export function StoryModeButton() {
  const dict = useDict();
  const { running, start, stop } = useStory();

  return (
    <button
      type="button"
      onClick={running ? stop : start}
      className={[
        'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
        running
          ? 'bg-city-emerald text-white'
          : 'border border-hairline bg-surface-raised text-ink-muted hover:bg-surface-sunken hover:text-ink',
      ].join(' ')}
    >
      <StoryIcon className="size-4" />
      <span className="hidden sm:inline">{running ? dict.story.stop : dict.story.start}</span>
    </button>
  );
}
