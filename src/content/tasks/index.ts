/**
 * Public surface of the procedural item bank (Phase 3.04). Import from
 * `@/content/tasks`.
 *
 * The headline export is {@link createTaskItemProvider} — the production
 * `ItemProvider` 3.05 injects into the engine's `createDomainController`, plus
 * `getPracticeItem(domain)`. The content-spec types (`TaskSpec` and friends) are
 * the rendering contract 3.05 draws and 3.02 designs against. The per-domain
 * `generate*` functions + the `solve`/`wrong` oracle are exported for tests + the
 * end-to-end determinism check.
 */
export {createTaskItemProvider, type TaskItemProvider} from './provider';
export * from './types';
export * from './glyphs';
export {correctAnswerFor, wrongAnswerFor, specOf, arraysEqual, pegStateEquals, itemId} from './shared';
export {generateGf, practiceGf} from './gf';
export {generateGv, practiceGv} from './gv';
export {generateGsm, practiceGsm} from './gsm';
export {generateGs, practiceGs} from './gs';
export {generateEf, practiceEf} from './ef';
export {generateGlr, practiceGlr} from './glr';
export {generateCt, practiceCt} from './ct';
