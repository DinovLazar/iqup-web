/**
 * "Assessment complete" + the child reward badge. The validity outcome decides
 * the framing: `valid` → a clean celebration; `gentle_note` (mild flag) → the
 * same celebration plus a soft, non-negative note carried forward (spec 7.1).
 * The "continue to your report" action is the `// HANDOFF (3.06)` seam where the
 * parent form plugs in — this phase does NOT render results or call the form.
 */
'use client';

import {ConfirmAction} from '../renderers/ConfirmAction';
import {ExplorerBadge} from './ExplorerBadge';
import type {AssessmentCopy} from '../copy';

export function CompletionScreen({
  copy,
  showGentleNote,
  reducedMotion,
  onContinue
}: {
  copy: AssessmentCopy['complete'];
  showGentleNote: boolean;
  reducedMotion: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <h1 className="font-brand text-2xl font-extrabold text-ink text-balance">
        {copy.title}
      </h1>

      <ExplorerBadge
        name={copy.badgeName}
        tagline={copy.badgeTagline}
        reducedMotion={reducedMotion}
      />

      <p className="text-ink-soft">{copy.body}</p>

      {showGentleNote && (
        <p className="rounded-card bg-field px-4 py-3 text-sm text-ink-soft">
          {copy.gentleNote}
        </p>
      )}

      <ConfirmAction label={copy.continue} onConfirm={onContinue} />
    </div>
  );
}
