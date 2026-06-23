/**
 * The renderer dispatcher: maps an engine `Item`'s `TaskSpec.taskType` to its
 * task-type renderer (the seam between the 3.04 content specs and the 3.05
 * screens). Every renderer reads the spec as data, renders the handover look, and
 * reports a `Response.answer` (+ telemetry) via `onAnswer`.
 */
'use client';

import type {Item} from '@/lib/engine/types';
import type {TaskSpec} from '@/content/tasks';
import {specOf} from '@/content/tasks';
import type {AnswerTelemetry, TaskRendererCopy} from '../types';
import {GfTask} from './GfTask';
import {GvTask} from './GvTask';
import {GsmTask} from './GsmTask';
import {GsTask} from './GsTask';
import {EfTask} from './EfTask';
import {GlrTask} from './GlrTask';
import {CtTask} from './CtTask';

export function TaskRenderer({
  item,
  copy,
  reducedMotion,
  assist,
  onAnswer
}: {
  item: Item;
  copy: TaskRendererCopy;
  reducedMotion: boolean;
  assist: boolean;
  onAnswer: (answer: unknown, telemetry?: AnswerTelemetry) => void;
}) {
  const spec: TaskSpec = specOf(item);
  const props = {spec, copy, reducedMotion, assist, onAnswer};

  switch (spec.taskType) {
    case 'gf.matrix':
    case 'gf.series':
      return <GfTask {...props} />;
    case 'gv.rotation':
      return <GvTask {...props} />;
    case 'gsm.corsi':
      return <GsmTask {...props} />;
    case 'gs.symbolSearch':
      return <GsTask {...props} />;
    case 'ef.towerOfLondon':
      return <EfTask {...props} />;
    case 'glr.pairedAssociate':
      return <GlrTask {...props} />;
    case 'ct.sequence':
    case 'ct.debug':
    case 'ct.loop':
    case 'ct.conditional':
    case 'ct.maze':
      return <CtTask {...props} />;
  }
}
