/**
 * English privacy / cookie-policy content.
 *
 * Phase 2.04 baseline; brought to the **v2 data model** in Phase 3.14 (two
 * unlinkable stores · child-data minimisation · on-device-only child name ·
 * emailed-not-stored PDF via Brevo · three parental consents vs. cookie consent ·
 * the internal back-office access surface · retention). The 3.12 Meta CAPI
 * processor disclosure + the `_fbc` cookie row are preserved.
 *
 * PROVISIONAL GDPR baseline — pending IqUp legal sign-off. The whole v2 narrative
 * is flagged for the legal reviewer.
 * Section ids are stable and language-neutral; they MUST stay in 1:1 structural
 * parity with `mk.ts` (same ids, same order, same block kinds in order, same
 * cookie rows). Enforced by `privacy.test.ts`.
 */
import type {PrivacyContent} from './types';

export const PRIVACY_EN: PrivacyContent = {
  version: 'privacy-v2-draft-2026-06',
  lastUpdated: '2026-06-25',
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
          text: 'IqUp is a free, playful set of thinking activities for children. A child works through a short series of original, age-appropriate puzzle-style games.'
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
          text: 'We keep the data we collect to a minimum, and we never ask for more than we need. With the parent’s consent, we collect:'
        },
        {
          kind: 'list',
          items: [
            'the parent’s first name, so the report and any follow-up can be addressed to a real person;',
            'the parent’s email address, so we can send the strengths profile and (if asked) help arrange a free demo class;',
            'the parent’s phone number and city, so the nearest IqUp centre can follow up about a demo class;',
            'the child’s age, which simply selects the right activities for them;',
            'the child’s gender — optional, and only if the parent chooses to share it;',
            'the parental consents, together with the date and time they were given and the version of this policy they relate to.'
          ]
        },
        {
          kind: 'p',
          text: 'We do not collect or store the child’s name, surname, address, or date of birth. Our legal basis for the above is your consent, which you can withdraw at any time.'
        }
      ]
    },
    {
      id: 'two-stores',
      heading: 'Two separate places, never linked',
      blocks: [
        {
          kind: 'p',
          text: 'The information above is kept in two separate stores that cannot be joined together:'
        },
        {
          kind: 'list',
          items: [
            'Anonymous results — the strengths profile your child’s activities produce is stored without any name, email or phone number, and with only the day it was taken. On its own it cannot be traced back to a person. It is hosted with Supabase in the European Union.',
            'Parent contact details — your name, email, phone and city are kept separately, with Brevo in the European Union, so we can follow up with you about a demo class.'
          ]
        },
        {
          kind: 'p',
          text: 'There is no shared key between the two, so a set of results can never be matched to a particular family. This separation is deliberate.'
        }
      ]
    },
    {
      id: 'childrens-data',
      heading: 'Children’s data',
      blocks: [
        {
          kind: 'p',
          text: 'A child can only take part when a parent or guardian provides the details and gives consent. We deliberately ask for as little as possible about the child.'
        },
        {
          kind: 'list',
          items: [
            'We never collect the child’s name, surname, date of birth or address. The child’s age is used only to choose suitable activities.',
            'If you choose to add your child’s first name to the celebratory certificate, that name stays in your browser, on your own device. It is never sent to us, never stored, and never placed in a web address (URL).',
            'The limited data we do keep is hosted within the European Union.'
          ]
        }
      ]
    },
    {
      id: 'emailed-report',
      heading: 'The report we email you',
      blocks: [
        {
          kind: 'p',
          text: 'When your child finishes, we build their strengths report as a PDF on the spot and email it to you. We do not store the report on our side — it is generated, sent through Brevo’s email service (whose own retention then applies), and not kept by us afterwards.'
        }
      ]
    },
    {
      id: 'consents',
      heading: 'The consents you give',
      blocks: [
        {
          kind: 'p',
          text: 'Before the report is sent, we ask for three separate, clearly-labelled consents — none of them pre-ticked:'
        },
        {
          kind: 'list',
          items: [
            'permission to process your details and send you the report (required);',
            'confirmation that you are the child’s parent or guardian (required);',
            'an optional agreement to receive occasional news and offers — you can say no and still get the report.'
          ]
        },
        {
          kind: 'p',
          text: 'These parental consents are entirely separate from the cookie and tracking choices described below — agreeing to one does not affect the other.'
        }
      ]
    },
    {
      id: 'internal-access',
      heading: 'Who at IqUp can see your data',
      blocks: [
        {
          kind: 'p',
          text: 'A small number of IqUp staff can view parent contact details and overall, anonymous statistics through a private internal tool, used only to follow up about demo classes and to understand how the activities are used. The two stores stay separate there too: a staff member never sees a particular child’s results next to that family’s contact details.'
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
            'Supabase (EU, Frankfurt) — hosts our database, including the anonymous results.',
            'Brevo (EU) — sends our emails and stores the parent contact details for follow-up.',
            'Google (Google Analytics 4) — measures how the site is used. Loaded only with your Analytics consent.',
            'Microsoft (Clarity) — anonymous usage insights and heatmaps. Loaded only with your Analytics consent.',
            'Meta (Pixel) — measures the effect of our ads. Loaded only with your Marketing consent.',
            // FLAG(IqUp legal): CAPI processor disclosure — provisional wording (Phase 3.12).
            'Meta (Conversions API) — when you submit the form with Marketing consent, a securely hashed (irreversible) copy of your contact details is sent from our server to Meta to measure the results of our ads. No test answers, profile or results are ever sent.'
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
          text: 'We keep parent contact details with Brevo for as long as needed to follow up about a possible demo class, and until you ask us to delete them or they are no longer needed — whichever comes first. The anonymous results carry no contact information and are kept to understand and improve the activities. The emailed report is not stored at all. When data is no longer needed, we delete it.'
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
    },
    {
      name: '_fbc',
      provider: 'Meta',
      purpose: 'Ad click attribution, also used to match conversions (set only with Marketing consent)',
      category: 'Marketing',
      duration: '~3 months'
    }
  ]
};
