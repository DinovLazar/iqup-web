# Part 1 · Phase 1.04 — Test Content & Scoring · Content Spec

**Phase:** 1.04 — Test content + scoring (Chat phase — authored directly, not handed to another Claude)
**Reads into:** Phase 1.07 (Test engine, Code) and Phase 1.10 (Results + certificate, Code)
**Status of copy:** **All Macedonian (MK) here is provisional, Claude-drafted, and must be finalised by the native-Macedonian reviewer.** English (EN) is the mirror.
**Originality:** Every item below is **original**, built only on general cognitive task *types*. Nothing is copied from any proprietary test.

---

## Contents
1. The six strengths (codes, colours, descriptions, display names)
2. Test shape per band (length, modality, distribution)
3. Scoring algorithm (deterministic — no AI, no total, no IQ number)
4. Recommended data schema (for Code)
5. Question banks — Band A (3–5), Band B (6–9), Band C (10–13)
6. Result / strengths-profile templates (MK + EN)
7. Asset & mechanic dependencies
8. Hand-off notes (Code · native MK reviewer · IqUp)

---

## 1. The six strengths

Each question feeds **exactly one** strength. The six map 1:1 onto the six strength colours defined in the 1.03 design foundation. The colour binding below is a **suggestion** — Code/Design may reassign, as long as one strength keeps one colour.

| Code | Strength | Suggested colour (1.03) | What it is | Display name EN | Display name MK |
|---|---|---|---|---|---|
| `pattern` | Pattern recognition | indigo | Spotting what repeats and predicting what comes next | Pattern Spotting | Откривање шаблони |
| `logic` | Logical reasoning | blue | Connecting clues; sorting; simple step-by-step deduction | Problem-Solving | Решавање проблеми |
| `memory` | Memory | rose | Holding and recalling what was just seen | Memory | Помнење |
| `spatial` | Spatial reasoning | teal | Shapes, rotation, fitting and picturing things in the mind | Shapes & Space | Форми и простор |
| `numeracy` | Numeracy | amber | Counting, comparing, working with quantities and numbers | Numbers | Броеви |
| `words_obs` | Words & observation | green | Careful looking (younger) + language/verbal reasoning (older) | Words & Observation | Зборови и набљудување |

**Display names** are the short labels used in headlines and on the certificate. The longer warm descriptions live in §6.

---

## 2. Test shape per band

Length is **"balanced"** (Lazar's choice): a real gradient by age, every band covers all six strengths. The 3–5 band is shortest and simplest (picture-only, parent-assisted); difficulty and reading load climb with age.

| Band | Code | Questions | Modality | Who drives it | Approx. time |
|---|---|---|---|---|---|
| 3–5 | `band-a` | **10** | Image-only stems & options | Parent reads & taps with child | ~4–5 min |
| 6–9 | `band-b` | **12** | Short text + simple images | Mostly child, solo | ~5–6 min |
| 10–13 | `band-c` | **14** | Full text + abstract figures | Child, solo | ~7–9 min |

**Strength distribution per band** (how many questions feed each strength):

| Strength | 3–5 | 6–9 | 10–13 |
|---|---|---|---|
| `pattern` | 2 | 2 | 3 |
| `logic` | 1 | 2 | 3 |
| `memory` | 1 | 2 | 2 |
| `spatial` | 2 | 2 | 2 |
| `numeracy` | 2 | 2 | 2 |
| `words_obs` | 2 | 2 | 2 |
| **Total** | **10** | **12** | **14** |

The youngest band leans on the most age-appropriate skills (pattern, observation, spatial, numeracy) and only lightly touches memory and logic; the oldest band adds weight to pattern and logic, its signature abstract-reasoning skills.

---

## 3. Scoring algorithm

Rule-based, fully deterministic, identical to compute in any language. **There is no total score and no IQ number anywhere in the product.**

```
For each strength s present in the band:
    total[s] = number of questions whose strength == s
    hits[s]  = number of those answered with the correct option
    score[s] = hits[s] / total[s]          // a ratio from 0 to 1

Rank the six strengths:
    1) by score[s], highest first
    2) tie-break by this fixed order:
       pattern, logic, spatial, numeracy, memory, words_obs
       (only matters for ties; never surfaces anything negatively)

Outputs used by the result screen / certificate:
    top1     = rank #1     → headline strength (always shown, always positive)
    top2     = rank #2     → headline strength
    top3     = rank #3     → "also strong"
    growing  = ranks #4–#6 → "growing" (never "weak", never "below")
```

**Why ratios, not raw counts:** strengths have different question counts per band, so a ratio judges each strength on its own questions and keeps the comparison fair.

**Edge cases:**
- *All tied (e.g. a perfect run, or all-equal):* the fixed tie-break order makes the result deterministic. Everything shown is genuinely a strength.
- *Low scores across the board:* the result **still** celebrates top1/top2 and frames the rest as "growing." The copy never implies failure — that is the design intent and the honest-IQ-framing rule.

---

## 4. Recommended data schema (for Code)

A suggested TypeScript shape so Code can transcribe §5 and §6 mechanically. Code owns the final implementation; if the live setup differs, the live code wins.

```ts
type Strength = 'pattern' | 'logic' | 'memory' | 'spatial' | 'numeracy' | 'words_obs';
type Band     = 'band-a' | 'band-b' | 'band-c';   // 3–5 · 6–9 · 10–13
type Locale   = 'mk' | 'en';

interface Option {
  id: string;                       // 'a' | 'b' | 'c' | 'd'
  label: Record<Locale, string>;    // visible text AND alt-text for image options
  image?: string;                   // asset key, optional (for visual options)
}

interface Question {
  id: string;                       // e.g. 'band-a-q01'
  band: Band;
  strength: Strength;
  prompt: Record<Locale, string>;
  visual?: string;                  // description/asset key for the stem image
  options: Option[];                // 2–4
  correct: string;                  // option id of the single best answer
  asset?: 'shapes' | 'icons' | 'scene' | 'text' | 'bibi-optional';
  mechanic?: 'reveal';              // memory items only (see §7)
  revealMs?: number;                // hint for the reveal duration
}
```

Banks live in `src/content/test/` (one file per band). Result templates live in `src/content/results/`. UI chrome strings stay in `src/messages/{mk,en}.json` per the scaffold's next-intl setup.

---

## 5. Question banks

Format per item: strength tag · single correct option · EN prompt + visual · MK prompt · options (EN then MK) · asset. For image options, the written label doubles as the accessible alt-text.

### 5A — Band 3–5 (`band-a`, 10 questions, image-only, parent-assisted)

**A-Q01 — `pattern`** · *correct: A*
- EN: "What comes next?" — Visual: a row of circles `[red, blue, red, blue, ?]`
- MK: „Што доаѓа следно?"
- Options EN: A) red circle · B) blue circle · C) yellow circle
- Options MK: А) црвен круг · Б) син круг · В) жолт круг
- Asset: shapes

**A-Q02 — `pattern`** · *correct: A*
- EN: "Which one finishes the row?" — Visual: `[apple, banana, apple, banana, apple, ?]`
- MK: „Што ја пополнува редицата?"
- Options EN: A) banana · B) apple · C) grapes
- Options MK: А) банана · Б) јаболко · В) грозје
- Asset: icons (fruit)

**A-Q03 — `words_obs`** · *correct: D*
- EN: "Which one is different?" — Visual: three identical ducks and one cat
- MK: „Кој е различен?"
- Options EN: A) duck · B) duck · C) duck · D) cat
- Options MK: А) патка · Б) патка · В) патка · Г) маче
- Asset: icons (animals)

**A-Q04 — `words_obs`** · *correct: A*
- EN: "Tap the red ball." — Visual: a small scene with a red ball, a blue car, a green tree
- MK: „Допри ја црвената топка."
- Options EN: A) red ball · B) blue car · C) green tree
- Options MK: А) црвена топка · Б) син автомобил · В) зелено дрво
- Asset: scene

**A-Q05 — `spatial`** · *correct: A*
- EN: "Which shape fits the hole?" — Visual: a star-shaped hole
- MK: „Која форма се вклопува во дупката?"
- Options EN: A) star · B) circle · C) square
- Options MK: А) ѕвезда · Б) круг · В) квадрат
- Asset: shapes

**A-Q06 — `spatial`** · *correct: B*
- EN: "Which one is the same shape?" — Visual: a triangle shown at the top
- MK: „Која форма е иста?"
- Options EN: A) circle · B) triangle · C) square
- Options MK: А) круг · Б) триаголник · В) квадрат
- Asset: shapes

**A-Q07 — `numeracy`** · *correct: B*
- EN: "How many apples?" — Visual: 3 apples
- MK: „Колку јаболка има?"
- Options EN: A) 2 · B) 3 · C) 4
- Options MK: А) 2 · Б) 3 · В) 4
- Asset: icons (apples) + number labels

**A-Q08 — `numeracy`** · *correct: B*
- EN: "Which group has more?" — Visual: a group of 2 balloons vs a group of 4 balloons
- MK: „Која група има повеќе?"
- Options EN: A) the group of 2 · B) the group of 4
- Options MK: А) групата од 2 · Б) групата од 4
- Asset: icons (balloons)

**A-Q09 — `memory`** · *correct: A* · **Mechanic: reveal (~3s)**
- Reveal: show a single cat for ~3 seconds, then hide it.
- EN: "Which animal did you just see?"
- MK: „Кое животно го виде?"
- Options EN: A) cat · B) dog · C) rabbit
- Options MK: А) маче · Б) куче · В) зајаче
- Asset: icons (animals)

**A-Q10 — `logic`** · *correct: A*
- EN: "Which one goes with the sock?" — Visual: a sock shown at the top
- MK: „Што оди со чорапот?"
- Options EN: A) shoe · B) apple · C) ball
- Options MK: А) чевел · Б) јаболко · В) топка
- Asset: icons (objects)

---

### 5B — Band 6–9 (`band-b`, 12 questions, short text + simple images, solo)

**B-Q01 — `pattern`** · *correct: A*
- EN: "What comes next?" — Visual: groups of dots `[1 dot, 2 dots, 3 dots, ?]`
- MK: „Што доаѓа следно?"
- Options EN: A) 4 dots · B) 2 dots · C) 5 dots
- Options MK: А) 4 точки · Б) 2 точки · В) 5 точки
- Asset: shapes (dot groups)

**B-Q02 — `pattern`** · *correct: A*
- EN: "Complete the pattern." — Visual: `[circle, square, square, circle, square, square, circle, square, ?]`
- MK: „Дополни го шаблонот."
- Options EN: A) square · B) circle · C) triangle
- Options MK: А) квадрат · Б) круг · В) триаголник
- Asset: shapes

**B-Q03 — `logic`** · *correct: D*
- EN: "Which one does NOT belong?" — Visual: bird, butterfly, aeroplane, dog (three things fly)
- MK: „Што НЕ припаѓа?"
- Options EN: A) bird · B) butterfly · C) aeroplane · D) dog
- Options MK: А) птица · Б) пеперутка · В) авион · Г) куче
- Asset: icons

**B-Q04 — `logic`** · *correct: A*
- EN: "All the red blocks are big. This block is red. So this block is…" — Visual: one red block
- MK: „Сите црвени коцки се големи. Оваа коцка е црвена. Значи, оваа коцка е…"
- Options EN: A) big · B) small · C) round
- Options MK: А) голема · Б) мала · В) тркалезна
- Asset: shapes (minimal)

**B-Q05 — `memory`** · *correct: B* · **Mechanic: reveal (~4s)**
- Reveal: show a 3-icon row in order — sun, star, moon — for ~4 seconds, then hide.
- EN: "Which one was in the MIDDLE?"
- MK: „Што беше во СРЕДИНАТА?"
- Options EN: A) sun · B) star · C) moon
- Options MK: А) сонце · Б) ѕвезда · В) месечина
- Asset: icons

**B-Q06 — `memory`** · *correct: A* · **Mechanic: reveal (~3s)**
- Reveal: show the number `371` for ~3 seconds, then hide.
- EN: "Which number did you just see?"
- MK: „Кој број го виде?"
- Options EN: A) 371 · B) 317 · C) 731
- Options MK: А) 371 · Б) 317 · В) 731
- Asset: text

**B-Q07 — `spatial`** · *correct: A*
- EN: "Which piece completes the picture?" — Visual: a circle with a triangular wedge missing
- MK: „Кое парче ја комплетира сликата?"
- Options EN: A) the matching wedge · B) a square piece · C) a smaller wedge
- Options MK: А) парчето што се вклопува · Б) квадратно парче · В) помало парче
- Asset: shapes

**B-Q08 — `spatial`** · *correct: B*
- EN: "Which one is the mirror image of this arrow?" — Visual: an arrow pointing up-and-right
- MK: „Која е огледалната слика на стрелката?"
- Options EN: A) arrow up-and-right · B) arrow up-and-left · C) arrow down-and-right
- Options MK: А) стрелка горе-десно · Б) стрелка горе-лево · В) стрелка долу-десно
- Asset: shapes

**B-Q09 — `numeracy`** · *correct: A*
- EN: "What number comes next? 2, 4, 6, ?"
- MK: „Кој број следи? 2, 4, 6, ?"
- Options EN: A) 8 · B) 7 · C) 10
- Options MK: А) 8 · Б) 7 · В) 10
- Asset: text

**B-Q10 — `numeracy`** · *correct: A*
- EN: "You have 5 stickers and give 2 away. How many are left?"
- MK: „Имаш 5 налепници и даваш 2. Колку ти остануваат?"
- Options EN: A) 3 · B) 2 · C) 7
- Options MK: А) 3 · Б) 2 · В) 7
- Asset: text

**B-Q11 — `words_obs`** · *correct: C*
- EN: "Which word does NOT belong? cat · dog · apple · fish"
- MK: „Кој збор НЕ припаѓа? маче · куче · јаболко · риба"
- Options EN: A) cat · B) dog · C) apple · D) fish
- Options MK: А) маче · Б) куче · В) јаболко · Г) риба
- Asset: text

**B-Q12 — `words_obs`** · *correct: B*
- EN: "Look carefully at the tree. How many birds can you count?" — Visual: a tree scene with 4 birds among leaves
- MK: „Погледни го дрвото внимателно. Колку птици има?"
- Options EN: A) 3 · B) 4 · C) 5
- Options MK: А) 3 · Б) 4 · В) 5
- Asset: scene *(primary strength here is careful observation in a busy scene, not arithmetic)*

---

### 5C — Band 10–13 (`band-c`, 14 questions, full text + abstract figures, solo)

**C-Q01 — `pattern`** · *correct: A*
- EN: "Which figure is missing?" — Visual: a 3×3 grid of dot-groups; each row counts up by one (row 1: 1,2,3 · row 2: 2,3,4 · row 3: 3,4,?)
- MK: „Која фигура недостасува?"
- Options EN: A) 5 dots · B) 4 dots · C) 6 dots
- Options MK: А) 5 точки · Б) 4 точки · В) 6 точки
- Asset: shapes (dot grids) *(original additive rule)*

**C-Q02 — `pattern`** · *correct: A*
- EN: "What number comes next? 2, 6, 18, 54, ?"  (each is ×3)
- MK: „Кој број следи? 2, 6, 18, 54, ?"
- Options EN: A) 162 · B) 108 · C) 216
- Options MK: А) 162 · Б) 108 · В) 216
- Asset: text

**C-Q03 — `pattern`** · *correct: A*
- EN: "An arrow turns 90° clockwise each step: up → right → down → ?"
- MK: „Стрелката се врти за 90° во насока на стрелките на часовникот: горе → десно → долу → ?"
- Options EN: A) left · B) up · C) right
- Options MK: А) лево · Б) горе · В) десно
- Asset: shapes (arrows)

**C-Q04 — `logic`** · *correct: C*
- EN: "Maya is taller than Bojan. Bojan is taller than Sara. Who is the shortest?"
- MK: „Маја е повисока од Бојан. Бојан е повисок од Сара. Кој е најнизок?"
- Options EN: A) Maya · B) Bojan · C) Sara
- Options MK: А) Маја · Б) Бојан · В) Сара
- Asset: text

**C-Q05 — `logic`** · *correct: A*
- EN: "If it rains, the match is cancelled. The match was NOT cancelled. What can we conclude?"
- MK: „Ако врне дожд, натпреварот се откажува. Натпреварот НЕ беше откажан. Што можеме да заклучиме?"
- Options EN: A) It did not rain · B) It rained · C) We cannot know
- Options MK: А) Не врнеше дожд · Б) Врнеше дожд · В) Не можеме да знаеме
- Asset: text

**C-Q06 — `logic`** · *correct: A*
- EN: "In one class, everyone who plays chess also plays piano. Ana plays chess. Which must be true?"
- MK: „Во едно одделение, секој што игра шах исто така свири пијано. Ана игра шах. Што мора да е точно?"
- Options EN: A) Ana plays piano · B) Ana does not play piano · C) We cannot know
- Options MK: А) Ана свири пијано · Б) Ана не свири пијано · В) Не можеме да знаеме
- Asset: text

**C-Q07 — `memory`** · *correct: C* · **Mechanic: reveal (~3s)**
- Reveal: show `7, 2, 9, 4` for ~3 seconds, then hide.
- EN: "What was the THIRD number?"
- MK: „Кој беше ТРЕТИОТ број?"
- Options EN: A) 7 · B) 2 · C) 9 · D) 4
- Options MK: А) 7 · Б) 2 · В) 9 · Г) 4
- Asset: text

**C-Q08 — `memory`** · *correct: A* · **Mechanic: reveal (~4s)**
- Reveal: show a 4-icon sequence — triangle, heart, square, star — for ~4 seconds, then hide.
- EN: "Which option shows the same order?"
- MK: „Која опција го покажува истиот редослед?"
- Options EN: A) triangle, heart, square, star · B) heart, triangle, square, star · C) triangle, square, heart, star
- Options MK: А) триаголник, срце, квадрат, ѕвезда · Б) срце, триаголник, квадрат, ѕвезда · В) триаголник, квадрат, срце, ѕвезда
- Asset: icons

**C-Q09 — `spatial`** · *correct: A*
- EN: "Which option is the SAME shape, just rotated?" — Visual: an asymmetric flag-like shape; one option is a rotation, one is its mirror (distractor)
- MK: „Која опција е истата фигура, само завртена?"
- Options EN: A) the rotation · B) the mirror image · C) a different shape
- Options MK: А) завртената · Б) огледалната · В) друга фигура
- Asset: shapes

**C-Q10 — `spatial`** · *correct: A*
- EN: "Which cube can be folded from this net?" — Visual: a simple 6-square cross net with distinct marks per face
- MK: „Која коцка може да се состави од оваа мрежа?"
- Options EN: A) the matching cube · B) a cube with two faces swapped · C) a cube with a wrong face
- Options MK: А) коцката што одговара · Б) коцка со заменети две страни · В) коцка со погрешна страна
- Asset: shapes *(slightly heavier graphic — see §7 for an easy substitution if asset time is tight)*

**C-Q11 — `numeracy`** · *correct: A*
- EN: "A toy costs 120 denars. It is 25% off. What is the new price?"
- MK: „Една играчка чини 120 денари. Намалена е за 25%. Која е новата цена?"
- Options EN: A) 90 denars · B) 95 denars · C) 100 denars
- Options MK: А) 90 денари · Б) 95 денари · В) 100 денари
- Asset: text

**C-Q12 — `numeracy`** · *correct: A*
- EN: "Which number does NOT fit? 9, 16, 25, 30, 36"  (the others are perfect squares)
- MK: „Кој број НЕ се вклопува? 9, 16, 25, 30, 36"
- Options EN: A) 30 · B) 16 · C) 36
- Options MK: А) 30 · Б) 16 · В) 36
- Asset: text

**C-Q13 — `words_obs`** · *correct: A*
- EN: "Bird is to nest as bee is to ___?"
- MK: „Птица е спрема гнездо како пчела спрема ___?"
- Options EN: A) hive · B) honey · C) flower
- Options MK: А) кошница · Б) мед · В) цвет
- Asset: text

**C-Q14 — `words_obs`** · *correct: A*
- EN: "Which word is the odd one out? ocean · lake · river · desert · pond"
- MK: „Кој збор е вишок? океан · езеро · река · пустина · бара"
- Options EN: A) desert · B) lake · C) river
- Options MK: А) пустина · Б) езеро · В) река
- Asset: text

---

## 6. Result / strengths-profile templates

The result speaks **to the parent** (the parent is the lead and reads the screen/email for every band). The certificate speaks **to the child**. A short kid-facing celebration plays first. Nothing ever reports a score, a rank, or a weakness.

Slot variables: `{child}` first name · `{top1_name}` `{top2_name}` `{top3_name}` strength display names · `{growing_list}` the remaining display names joined naturally · `{center}` the nearest IqUp centre.

### 6A — Strength blurbs (celebrated + growing)

Used when a strength lands in the headline (celebrated) or in the "growing" group.

**`pattern`**
- Celebrated EN: "Your child has a sharp eye for patterns — noticing what repeats and sensing what comes next. It's the same thinking that powers maths, music, and coding."
- Celebrated MK: „Вашето дете има остро око за шаблони — забележува што се повторува и насетува што следи. Тоа е истото размислување што стои зад математиката, музиката и програмирањето."
- Growing EN: "their feel for patterns is blossoming"
- Growing MK: „нивниот усет за шаблони цвета"

**`logic`**
- Celebrated EN: "Your child loves to figure things out — connecting clues and reasoning step by step to an answer. That's the heart of problem-solving."
- Celebrated MK: „Вашето дете сака да доаѓа до решенија — поврзува траги и размислува чекор по чекор до одговорот. Тоа е срцето на решавањето проблеми."
- Growing EN: "their reasoning is growing sharper"
- Growing MK: „нивното логичко размислување станува сè поостро"

**`memory`**
- Celebrated EN: "Your child holds on to what they see and recalls it with ease — a strong memory that makes every kind of learning lighter."
- Celebrated MK: „Вашето дете памти што гледа и лесно се сеќава — силно помнење што го олеснува секој вид учење."
- Growing EN: "their memory is getting stronger every day"
- Growing MK: „нивното помнење станува сè поцврсто секој ден"

**`spatial`**
- Celebrated EN: "Your child thinks in shapes and space — picturing how things fit, turn, and connect. It's the imagination behind building, art, and engineering."
- Celebrated MK: „Вашето дете размислува преку форми и простор — замислува како нештата се вклопуваат, се вртат и се поврзуваат. Тоа е имагинацијата зад градењето, уметноста и инженерството."
- Growing EN: "their sense of shape and space is developing beautifully"
- Growing MK: „нивниот усет за форми и простор убаво се развива"

**`numeracy`**
- Celebrated EN: "Your child has a natural friendship with numbers — counting, comparing, and working with quantities with real confidence."
- Celebrated MK: „Вашето дете има природно пријателство со броевите — брои, споредува и работи со количини со вистинска сигурност."
- Growing EN: "their number sense is growing"
- Growing MK: „нивниот усет за броеви расте"

**`words_obs`**
- Celebrated EN: "Your child notices the little things and finds the right words — careful observation and language that fuel curiosity and communication."
- Celebrated MK: „Вашето дете ги забележува деталите и ги наоѓа вистинските зборови — внимателно набљудување и јазик што ги поттикнуваат љубопитноста и комуникацијата."
- Growing EN: "their eye for detail and words keeps growing"
- Growing MK: „нивното око за детали и зборови постојано расте"

### 6B — Result wrapper (assembled per band)

**Kid-facing celebration** (all bands — plays first, big and bright):
- EN: "Hooray! You finished the IqUp Brain Games!"
- MK: „Ура! Ги заврши Мозочните игри на IqUp!"

**Headline** (all bands — parent-facing):
- EN: "Here's what we noticed about {child}: their brain really lit up in {top1_name} and {top2_name}."
- MK: „Еве што забележавме кај {child}: умот вистински засвети во {top1_name} и {top2_name}."

→ followed by the **celebrated blurbs** for `top1` and `top2` (from §6A).

**Also-strong line** (rank #3):
- EN: "We also saw real strength in {top3_name}."
- MK: „Видовме вистинска сила и во {top3_name}."

**Growing line** (ranks #4–#6):
- EN: "And there's more on the way — {growing_list} are all growing beautifully."
- MK: „И има уште нешто во подем — {growing_list} убаво се развиваат."

**Call to action — bands 3–5 and 6–9 only** (the trial invite):
- EN: "Want to see {child}'s curiosity in action? Come to a free trial class at IqUp {center} — playful, hands-on, and no pressure at all."
- MK: „Сакате да ја видите љубопитноста на {child} во акција? Дојдете на бесплатен пробен час во IqUp {center} — забавно, практично и без никаква обврска."

**Closing — band 10–13 only** (no program for this age; ends warmly):
- EN: "These strengths are {child}'s to build on — keep feeding that curious mind. You can download and share the certificate below."
- MK: „Овие сили се основата врз која {child} може да гради — продолжете да го хранат тој љубопитен ум. Подолу можете да го преземете и споделите сертификатот."

### 6C — Certificate copy (kid-facing, all bands)

- EN: "{child} completed the IqUp Brain Games and shone in {top1_name} & {top2_name}!"
- MK: „{child} ги заврши Мозочните игри на IqUp и заблеска во {top1_name} и {top2_name}!"

Plus a date line and IqUp branding (visual treatment handled in Phase 1.09). Bibi artwork on the certificate uses **existing licensed assets only** — never redrawn.

---

## 7. Asset & mechanic dependencies

**The reveal mechanic** (memory items: A-Q09, B-Q05, B-Q06, C-Q07, C-Q08):
- Show the stimulus centred, then hide it and reveal the question + options.
- Give the child/parent control of the start: a **"Ready?"** tap begins the reveal, the stimulus shows for the item's `revealMs` (default 3000ms; 4000ms for multi-item sequences), then auto-hides.
- **Accessibility / reduced-motion:** offer a manual version — a **"Show"** button, then a **"I'm ready"** button to hide and continue — instead of an auto-timer. No animation needed beyond a simple show/hide.
- Each memory item carries `mechanic: 'reveal'` and a `revealMs` hint.

**Graphics needed** — all are **simple, original** figures. None require proprietary test images; none require redrawing Bibi:
- Geometric shapes: circles, squares, triangles, stars, hearts, arrows (incl. rotations & mirrors), dot-groups, a 3×3 dot grid, a missing-wedge piece, an asymmetric rotation shape, a 6-square cube net + cubes.
- Everyday-object icons: apple, banana, grapes, duck, cat, dog, rabbit, bird, butterfly, aeroplane, ball, sock, shoe, balloons, sun, star, moon, tree-with-birds scene, a red block.
- These can be built as inline SVG and/or Lucide icons during the test-engine build.
- **Bibi artwork is optional decoration only** (e.g. a character cheering between questions) and only where an existing licensed asset fits — never as puzzle content, so the test never depends on assets that haven't arrived yet.
- **One flag:** the cube-net item (C-Q10) is the heaviest graphic. If asset time is tight, swap it for a second rotation or pattern item of the same `spatial`/`pattern` type — the distribution still holds.

**The `{center}` slot:** filled by the parent's nearest/chosen IqUp centre. The selection mechanism (city picker or geo) is a results/landing concern, finalised in the results build and the trial-booking phase — not part of this content.

---

## 8. Hand-off notes

**For Claude Code (Phase 1.07 test engine, Phase 1.10 results):**
- Transcribe §5 into `src/content/test/{band-a,band-b,band-c}.{ts|json}` per the §4 schema; implement scoring exactly per §3 (no total, no IQ number).
- Implement the reveal mechanic per §7, including the reduced-motion fallback.
- Build the results screen from §6 templates in `src/content/results/`; result copy is parent-facing, certificate copy is kid-facing.
- Map the six strengths to the six 1.03 colours (§1); use the 1.03 design handover for the question-screen look.
- Accessibility: options as an accessible radio group, ≥44px targets, alt-text from each option's `label`, visible focus, feedback by icon + colour (never colour alone).
- Keep MK + EN fully in parallel.

**For the native-Macedonian reviewer:**
- **Every MK string here is provisional, Claude-drafted.** Review all prompts, options, and templates for natural, child-appropriate Macedonian; check the logic items read clearly; confirm number/`денари` formatting. EN is the mirror — keep them equivalent.

**For IqUp:**
- The result is strengths-based, fully positive, and reports **no score and no IQ number** — consistent with the project's honest-IQ-framing rule. Final privacy/consent wording remains IqUp's sign-off (separate from this content).
