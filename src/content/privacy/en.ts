/**
 * English privacy / cookie-policy content (Phase 2.04).
 *
 * PROVISIONAL GDPR baseline — pending IqUp legal sign-off.
 * Section ids are stable and language-neutral; they MUST stay in 1:1 structural
 * parity with `mk.ts` (same ids, same order, same block kinds in order, same
 * cookie rows). Enforced by `privacy.test.ts`.
 */
import type {PrivacyContent} from './types';

export const PRIVACY_EN: PrivacyContent = {
  version: 'privacy-v1-draft-2026-06',
  lastUpdated: '2026-06-19',
  sections: [
    {
      id: 'who-we-are',
      heading: 'Who we are',
      blocks: [
        {
          kind: 'p',
          text: 'IqUp is run by IKUP d.o.o., based at Todor Aleksandrov No. 4, 1000 Skopje, North Macedonia. We are the controller of the personal data described on this page — we decide what is collected and why.'
        },
        {
          kind: 'p',
          // TODO(IqUp: confirm privacy contact email / DPO)
          text: 'If you have any questions about privacy, or you want to use any of the rights described below, write to us at info@iqup.mk.'
        }
      ]
    },
    {
      id: 'what-this-is',
      heading: 'What this site is',
      blocks: [
        {
          kind: 'p',
          text: 'IqUp is a free, age-banded set of playful brain games for children. A child answers a short series of original puzzle-style activities chosen for their age.'
        },
        {
          kind: 'p',
          text: 'The outcome is an encouraging strengths profile that highlights what a child enjoys and does well. It is not a clinical assessment and it does not produce a number — there is no figure or measure of any kind to compare children against each other.'
        }
      ]
    },
    {
      id: 'what-we-collect',
      heading: 'What we collect and why',
      blocks: [
        {
          kind: 'p',
          text: 'We keep the data we collect to a minimum. With the parent’s consent, we collect:'
        },
        {
          kind: 'list',
          items: [
            'the parent’s email address, so we can send the strengths profile and (if asked) help arrange a trial;',
            'the child’s first name, used to personalise the encouraging profile and certificate;',
            'the child’s age, which simply selects the right age band of activities;',
            'the derived strengths summary — we do not store the individual answers the child gave, only the warm summary of strengths;',
            'the language you used;',
            'the parental consent, together with the date and time it was given and the version of this policy it relates to;',
            'an optional, separate marketing opt-in, only if the parent chooses it.'
          ]
        },
        {
          kind: 'p',
          text: 'Our legal basis for all of the above is your consent. You can withdraw it at any time, as explained further down.'
        }
      ]
    },
    {
      id: 'childrens-data',
      heading: 'Children’s data',
      blocks: [
        {
          kind: 'p',
          text: 'A child can only take part when a parent or guardian provides the details and gives consent. We deliberately ask for as little as possible.'
        },
        {
          kind: 'list',
          items: [
            'We do not collect surnames, dates of birth, addresses or any other identifying details about the child.',
            'The child’s first name stays in your browser to personalise the certificate, and is never placed in a web address (URL).',
            'The limited data we do keep is hosted within the European Union.'
          ]
        }
      ]
    },
    {
      id: 'processors',
      heading: 'Where the data goes',
      blocks: [
        {
          kind: 'p',
          text: 'We use a small number of trusted service providers to run IqUp. Each one only handles data for the purpose described.'
        },
        {
          kind: 'list',
          items: [
            'Supabase (EU, Frankfurt) — hosts our database.',
            'Brevo (EU) — sends our emails and stores contact details for follow-up.',
            'Google (Google Analytics 4) — measures how the site is used. Loaded only with your Analytics consent.',
            'Microsoft (Clarity) — anonymous usage insights and heatmaps. Loaded only with your Analytics consent.',
            'Meta (Pixel) — measures the effect of our ads. Loaded only with your Marketing consent.'
          ]
        }
      ]
    },
    {
      id: 'cookies',
      heading: 'Cookies and similar technologies',
      blocks: [
        {
          kind: 'p',
          text: 'We use a few cookies that are strictly necessary for the site to work and to remember your choices. Analytics and marketing cookies are set only after you give consent, and you can change your choice at any time using Cookie settings.'
        },
        {
          kind: 'p',
          text: 'The table below lists the cookies we actually use.'
        }
      ]
    },
    {
      id: 'retention',
      heading: 'How long we keep data',
      blocks: [
        {
          kind: 'p',
          text: 'These retention periods are provisional and may change after legal review.'
        },
        {
          kind: 'p',
          text: 'We keep parent contact details and the strengths summary for as long as needed to follow up about a possible trial, and until the parent asks us to delete them or they are no longer needed — whichever comes first. When data is no longer needed, we delete it.'
        }
      ]
    },
    {
      id: 'your-rights',
      heading: 'Your rights',
      blocks: [
        {
          kind: 'p',
          text: 'Under the General Data Protection Regulation (GDPR) and applicable local law, you have the right to:'
        },
        {
          kind: 'list',
          items: [
            'access the data we hold about you;',
            'have inaccurate data corrected (rectification);',
            'have your data deleted (erasure);',
            'restrict how we use your data;',
            'object to certain uses of your data;',
            'receive your data in a portable form (portability);',
            'withdraw your consent at any time.'
          ]
        },
        {
          kind: 'p',
          text: 'To use any of these rights, contact us using the details in the "Who we are" section above. You also have the right to lodge a complaint with North Macedonia’s supervisory authority, the Agency for Personal Data Protection (Агенција за заштита на личните податоци).'
        }
      ]
    },
    {
      id: 'withdraw-consent',
      heading: 'Withdrawing or changing cookie consent',
      blocks: [
        {
          kind: 'p',
          text: 'You are always in control. You can change or withdraw your cookie consent at any time — analytics and marketing cookies will stop being set as soon as you do. Use the button below to reopen your cookie choices.'
        }
      ]
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      blocks: [
        {
          kind: 'p',
          text: 'We may update this policy as IqUp grows and after legal review. When we do, we change the version and the last-updated date shown at the top of this page.'
        }
      ]
    }
  ],
  cookieTable: [
    {
      name: 'iqup_consent',
      provider: 'IqUp (this site)',
      purpose: 'Stores your cookie choices',
      category: 'Necessary',
      duration: '~6 months'
    },
    {
      name: 'NEXT_LOCALE',
      provider: 'IqUp (this site)',
      purpose: 'Remembers your language',
      category: 'Necessary',
      duration: '~1 year'
    },
    {
      name: '_ga, _ga_*',
      provider: 'Google',
      purpose: 'Usage analytics (set only with Analytics consent)',
      category: 'Analytics',
      duration: 'up to ~2 years'
    },
    {
      name: '_clck, _clsk',
      provider: 'Microsoft Clarity',
      purpose: 'Usage analytics and heatmaps (set only with Analytics consent)',
      category: 'Analytics',
      duration: '~1 year / ~1 day'
    },
    {
      name: '_fbp',
      provider: 'Meta',
      purpose: 'Ad measurement (set only with Marketing consent)',
      category: 'Marketing',
      duration: '~3 months'
    }
  ]
};
