/**
 * English About-the-test content (Phase 3.14).
 *
 * Section ids are stable and language-neutral; they MUST stay in 1:1 structural
 * parity with `mk.ts` (same ids, same order, same block kinds in order). Enforced
 * by `about.test.ts`, which also scans this prose for forbidden score/IQ/clinical
 * vocabulary (the clinical/IQ/diagnosis negation comes from the shared notice).
 */
import type {AboutContent} from './types';

export const ABOUT_EN: AboutContent = {
  sections: [
    {
      id: 'what-it-is',
      heading: 'What IqUp is',
      blocks: [
        {
          kind: 'p',
          text: 'IqUp is a free, playful set of thinking activities for children aged five to thirteen. Your child solves a short, adaptive series of puzzle-style games — the activities gently adjust as they go to find the right challenge, so every child meets puzzles that fit them.'
        },
        {
          kind: 'p',
          text: 'From how your child plays, IqUp draws a warm, strengths-based profile across five everyday areas of thinking:'
        },
        {
          kind: 'list',
          items: [
            'Logical — spotting patterns and reasoning step by step',
            'Spatial — picturing shapes, space and how things fit together',
            'Memory & focus — holding things in mind and paying attention',
            'Planning & speed — thinking ahead and working smoothly',
            'Learning & STEM — curiosity, problem-solving and the spark behind coding and science'
          ]
        },
        {
          kind: 'p',
          text: 'The profile is shown as a friendly picture — a five-pointed shape and warm words — that celebrates what your child enjoys and does well. It is always given as a picture and in words, and never as a number that sorts children one against another.'
        }
      ]
    },
    {
      id: 'what-it-isnt',
      heading: "What IqUp isn't",
      withNotice: true,
      blocks: [
        {
          kind: 'p',
          text: 'Just as important is what IqUp is not. It is not an exam. There are no right or wrong answers and nothing to get marked. It does not hand out a number, a label, or a verdict, and it is never a way to compare one child against another.'
        },
        {
          kind: 'p',
          text: 'Children grow at their own pace, and a short, playful game is only ever a gentle, encouraging snapshot of a single day. So we keep the honest framing front and centre:'
        }
      ]
    },
    {
      id: 'credibility',
      heading: 'Why parents can trust it',
      blocks: [
        {
          kind: 'p',
          text: 'IqUp is built on an established way of understanding how children reason, remember, picture space, plan and learn. We turned that into a friendly experience designed with care for young minds.'
        },
        {
          kind: 'p',
          text: 'A few things we hold ourselves to:'
        },
        {
          kind: 'list',
          items: [
            'Original activities. Every puzzle is our own, generated fresh within well-recognised families of thinking games — matrices, rotations, memory spans, step-by-step planning, pairing and simple coding-style logic. We never copy questions from any existing test.',
            'Adaptive, the kind way. The activities adjust to your child as they go, so the experience stays comfortable — never too easy, never overwhelming.',
            'Honest about our reference values. The age comparisons rest on starting reference values that we keep refining as more children play. That is exactly why we show the result in words and a picture, and never as a precise number.',
            'Made for encouragement. We always lead with strengths and frame growth areas kindly — as the next fun thing to explore, never as something missing.'
          ]
        },
        {
          kind: 'p',
          text: "And there's a natural bridge to what comes next. The kind of thinking these games celebrate — patterns, logic, planning and problem-solving — is exactly the thinking behind coding, robotics and STEM. A child who lights up here often loves where IqUp's classes go."
        }
      ]
    },
    {
      id: 'what-you-receive',
      heading: 'What you and your child receive',
      blocks: [
        {
          kind: 'p',
          text: 'At the end, three things are waiting:'
        },
        {
          kind: 'list',
          items: [
            'A profile on screen — your child’s five strengths as a warm picture and a few encouraging words, right away.',
            'A keepsake report by email — the same profile, gathered into a friendly PDF you can keep. We email it and don’t store it.',
            'A shareable certificate — a celebratory “IqUp Explorer” keepsake your child can be proud of.'
          ]
        },
        {
          kind: 'p',
          text: 'And an open invitation: if your child enjoys this kind of thinking, come and meet us at a free demo class at your nearest IqUp centre — no pressure, just a fun taste of what we do.'
        }
      ]
    }
  ]
};
