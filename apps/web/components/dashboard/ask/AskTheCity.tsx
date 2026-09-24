'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useDashboard } from '../state/DashboardProvider';
import { useMotionOK } from '@/lib/motion';
import { ask, type AskResult } from '@/lib/ask';
import { Card, CardHeader } from '../ui/Card';
import { SearchIcon, CloseIcon } from '../ui/Icons';

const HIGHLIGHT_MS = 6000;

export function AskTheCity() {
  const { dict, data, locale, selection, setHighlight } = useDashboard();
  const motionOK = useMotionOK();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AskResult | null>(null);
  const [missed, setMissed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function run(text: string) {
    const answer = ask(text, data, selection, locale, dict.common.cityWide);
    setResult(answer);
    setMissed(answer === null);

    if (timer.current) clearTimeout(timer.current);
    if (answer) {
      setHighlight(answer.highlight);
      // The ring is a pointer, not a state — it fades on its own.
      timer.current = setTimeout(() => setHighlight(null), HIGHLIGHT_MS);
    } else {
      setHighlight(null);
    }
  }

  function clear() {
    setQuery('');
    setResult(null);
    setMissed(false);
    setHighlight(null);
    if (timer.current) clearTimeout(timer.current);
  }

  // Four suggestions is enough to teach the pattern without becoming a menu.
  const suggestions = data.ask.slice(0, 4);

  return (
    <Card data-story-anchor="ask-the-city">
      <CardHeader title={dict.ask.title} />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          run(query);
        }}
        className="flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3 py-2"
      >
        <SearchIcon className="size-4 shrink-0 text-ink-subtle" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.ask.placeholder}
          aria-label={dict.ask.title}
          className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-subtle"
        />
        {query ? (
          <button
            type="button"
            onClick={clear}
            aria-label={dict.ask.clear}
            className="grid size-6 shrink-0 place-items-center rounded-md text-ink-subtle hover:text-ink"
          >
            <CloseIcon className="size-3.5" />
          </button>
        ) : null}
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-city-emerald px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {dict.ask.submit}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.p
            key={result.entry.id + result.answer}
            initial={motionOK ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionOK ? 0.25 : 0 }}
            className="mt-3 rounded-xl bg-gold-gradient px-3 py-2.5 text-xs font-medium leading-relaxed text-velvet"
            role="status"
          >
            {result.answer}
          </motion.p>
        ) : missed ? (
          <motion.p
            key="missed"
            initial={motionOK ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs text-ink-subtle"
            role="status"
          >
            {dict.ask.noMatch}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <p className="mt-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
        {dict.ask.suggestions}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {suggestions.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => {
                setQuery(entry.suggestion[locale]);
                run(entry.suggestion[locale]);
              }}
              className="rounded-full border border-hairline px-2.5 py-1 text-start text-[11px] text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              {entry.suggestion[locale]}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
