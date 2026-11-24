import type { Lecture } from '../../types';

/** Second deck in this lecture (chapter 5, 39 slides); its facts carry `deck: TE` so the slide numbers are not mixed up. */
const TE = 'Terminology EN';

/**
 * Lecture 4: the integumentary system (skin). First deck: 6 of the 19 slides of "Integumentary system M-T 1"
 * (9, 10, 15–18), sent as screenshots. Second deck: "Integumentary System Terminology (EN)", all 39 slides.
 * Words and parts live in the lexicon (src/content/lexicon.ts).
 */
const lecture: Lecture = {
  id: 'integumentary',
  title: 'מערכת העור (דרמטולוגיה)',
  source: 'Integumentary system M-T 1 (שקפים 9, 10, 15–18 מתוך 19) + Integumentary System Terminology (EN), פרק 5',
  subtitle: 'חלקי מילים של העור, מחלות עור, תרופות וקיצורים',
  icon: '🧴',
  hue: 35,
  added: '2026-11-09',
  updated: { date: '2026-11-09', note: 'נוספה המצגת המלאה: שכבות העור, סוגי נגעים, כוויות, אונקולוגיה ובדיקות' },
  intro:
    'השיעור על מערכת העור, לפי המצגת. מתחילים בחלקי המילים של העור, השומן, הזיעה, השיער והציפורניים, ' +
    'ממשיכים למחלות ולמונחים הקליניים, ומסיימים בתרופות לעור ובקיצורים. ' +
    'אחר כך המצגת השנייה: שכבות העור, איך מתארים נגע, זיהומים, כוויות, סרטן העור, בדיקות וטיפולים.',
  concepts: [
    {
      title: 'שלוש מילים לעור',
      body: 'בתוך מילה העור הוא השורש derm/o או dermat/o, למשל hypodermic. בסוף מילה העור הוא הסיומת derma, למשל xeroderma. גם cutane/o פירושה עור, למשל subcutaneous.',
      example: 'hypodermic',
    },
    {
      title: 'זוגות עם אותה משמעות',
      body: 'לעור יש הרבה שורשים כפולים. שומן: adip/o או lip/o או steat/o. זיעה: hidr/o או sudor/o. ציפורן: onych/o או ungu/o. שיער: pil/o או trich/o.',
      example: 'onychomalacia',
    },
    {
      title: 'זיעה או מים?',
      body: 'hidr/o היא זיעה, ו-hydr/o היא מים. anhidrosis היא היעדר הזעה, ו-hyperhidrosis היא הזעת יתר (נקראת גם diaphoresis או sudoresis).',
      example: 'hyperhidrosis',
    },
    {
      title: 'דימום בעור: קטן וגדול',
      body: 'petechia היא דימום קטנטן, בגודל של נקודה, מתחת לעור. ecchymosis היא אזור דימום גדול, כלומר חבורה. purpura היא קבוצת הפרעות דימום שגורמות לשניהם.',
    },
    {
      title: 'תרופות לעור לפי מה שהן עושות',
      body: 'קורטיקוסטרואידים מורידים דלקת וגרד, אנטיהיסטמינים מורידים תגובה אלרגית, קרטוליטים מקלפים את השכבה העליונה, ופרזיטיסידים הורגים קרדית וכינים.',
    },
    {
      title: 'איך מתארים נגע',
      body: 'שטוח או מוגבה, מוצק או עם נוזל. macule הוא כתם שטוח, papule הוא נגע קטן ומוגבה, nodule הוא נגע מוצק ועמוק. vesicle היא שלפוחית קטנה, bulla היא שלפוחית גדולה, ו-pustule מכיל מוגלה.',
    },
  ],
  quiz: [
    {
      q: 'מה פירוש hidr/o?',
      options: ['מים', 'זיעה', 'שיער', 'שומן'],
      answer: 1,
      explain: 'hidr/o היא זיעה. לא לבלבל עם hydr/o, שהיא מים.',
    },
    {
      q: 'איזה שורש פירושו ציפורן?',
      options: ['onych/o', 'trich/o', 'kerat/o', 'seb/o'],
      answer: 0,
      explain: 'onych/o ו-ungu/o הן ציפורן. trich/o היא שיער.',
    },
    {
      q: 'מה ההבדל בין petechia ל-ecchymosis?',
      options: ['petechia היא דימום קטנטן, ecchymosis היא חבורה גדולה', 'petechia היא חבורה גדולה, ecchymosis היא דימום קטנטן', 'שתיהן שמות של גרד', 'שתיהן זיהום פטרייתי'],
      answer: 0,
    },
  ],
  words: [
    'adiposis', 'lipocele', 'steatitis', 'dermatoplasty', 'hypodermic',
    'hidradenitis', 'sudoresis', 'ichthyosis', 'keratosis', 'melanoma', 'dermatomycosis',
    'onychomalacia', 'ungual', 'subungual', 'pilonidal', 'trichopathy', 'scleroderma',
    'seborrhea', 'squamous', 'xeroderma', 'lipocyte', 'pyoderma', 'dermatologist',
    'cryotherapy', 'anhidrosis', 'hyperhidrosis', 'epidermis',
    'onychomycosis', 'lipoma', 'melanocyte', 'dermatosis', 'intradermal', 'cutaneous',
  ],
  parts: [
    'adip', 'lip', 'steat', 'cutane', 'dermat', 'derm', 'hidr', 'sudor', 'ichthy', 'kerat',
    'melan', 'myc', 'onych', 'ungu', 'pil', 'trich', 'scler', 'seb', 'squam', 'xer', 'py', 'cry', 'nid',
    'cele', 'esis', 'derma_sfx', 'logist', 'therapy', 'cyte', 'logy', 'plasty', 'malacia', 'pathy',
    'rrhea', 'oma', 'osis', 'itis', 'ous', 'al', 'ic',
    'an', 'dia', 'epi', 'hyper', 'hypo', 'sub', 'intra',
  ],
  facts: [
    // anatomy and word building (second deck first: the basics before the diseases)
    { id: 'te-layers', q: 'מה שלוש שכבות העור, מבחוץ פנימה?', a: 'epidermis, dermis ו-hypodermis (subcutis)', wrong: ['dermis, epidermis ו-hypodermis', 'epidermis, hypodermis ו-dermis', 'cuticle, dermis ו-fascia'], slide: 3, deck: TE },
    { id: 'te-dermis', q: 'ממה בנוי ה-dermis?', a: 'רקמת חיבור תומכת', wrong: ['רקמה עשירה בשומן', 'תאי קרטין מתים', 'שריר'], slide: 3, deck: TE },
    { id: 'te-hypodermis', q: 'מה מאפיין את ה-hypodermis (subcutis)?', a: 'רקמה תת-עורית עשירה בשומן', wrong: ['השכבה החיצונית של העור', 'רקמת חיבור בלי שומן', 'שכבת ציפורן'], slide: 3, deck: TE },
    { id: 'te-integument', q: 'מה פירוש integument?', a: 'העור, כיסוי הגוף', wrong: ['רקמת שומן', 'בלוטת זיעה', 'זקיק שיער'], slide: 4, deck: TE },
    { id: 'te-homeostasis', q: 'מה פירוש homeostasis?', a: 'שמירה על יציבות פנימית', wrong: ['דימום מתחת לעור', 'קיפאון דם', 'הפרשת זיעה'], slide: 4, deck: TE },
    { id: 'te-keratin', q: 'מהו keratin?', a: 'חלבון מבני של העור, השיער והציפורניים', wrong: ['הפיגמנט שנותן צבע לעור', 'הפרשה שומנית', 'סוג של זיעה'], slide: 5, deck: TE },
    { id: 'te-keratinocyte', q: 'מהו keratinocyte?', a: 'תא שמייצר קרטין', wrong: ['תא שמייצר מלנין', 'תא שומן', 'תא של בלוטת זיעה'], slide: 5, deck: TE },
    { id: 'te-melanin', q: 'מהו melanin?', a: 'פיגמנט שתורם לצבע העור', wrong: ['חלבון מבני של הציפורן', 'הפרשה של בלוטות החלב', 'תא שמייצר קרטין'], slide: 5, deck: TE },
    { id: 'te-sebaceous', q: 'מה מייצרת בלוטת חלב (sebaceous gland)?', a: 'שמן (sebum)', wrong: ['זיעה', 'קרטין', 'מלנין'], slide: 6, deck: TE },
    { id: 'te-sudoriferous', q: 'איך נקראת בלוטת הזיעה?', a: 'sudoriferous gland', wrong: ['sebaceous gland', 'hair follicle', 'lunula'], slide: 6, deck: TE },
    { id: 'te-follicle', q: 'מהו זקיק שיער (hair follicle)?', a: 'המבנה שעוטף את שורש השערה', wrong: ['בלוטה שמייצרת שמן', 'הסהר הבהיר בבסיס הציפורן', 'תא שמייצר מלנין'], slide: 6, deck: TE },
    { id: 'te-alopecia', q: 'מהי alopecia?', a: 'נשירה או אובדן של שיער', wrong: ['צמיחת שיער מוגברת', 'זיהום של זקיק השיער', 'ריכוך הציפורניים'], slide: 6, deck: TE },
    { id: 'te-nail-bed', q: 'מהו nail bed?', a: 'הרקמה שמתחת ללוחית הציפורן', wrong: ['הסהר הבהיר בבסיס הציפורן', 'הלוחית הקשה של הציפורן', 'העור שסביב הציפורן'], slide: 7, deck: TE },
    { id: 'te-lunula', q: 'מהי lunula?', a: 'הסהר הבהיר בבסיס הציפורן', wrong: ['הרקמה שמתחת לציפורן', 'זיהום של הציפורן', 'בלוטה ליד הציפורן'], slide: 7, deck: TE },
    { id: 'te-root-role', q: 'מה תפקיד השורש במונח רפואי?', a: 'קובע את המבנה או הרעיון המרכזי', wrong: ['מוסיף מיקום, כמות או היעדר', 'מציין מצב, פעולה או תחום', 'מחבר בין חלקי המילה'], slide: 8, deck: TE },
    { id: 'te-prefix-role', q: 'מה מוסיפה קידומת למונח?', a: 'מיקום, כמות או היעדר', wrong: ['את המבנה המרכזי', 'מצב, פעולה או תחום לימוד', 'תנועה מחברת'], slide: 8, deck: TE },
    { id: 'te-suffix-role', q: 'מה מציינת סיומת?', a: 'מצב, פעולה או תחום לימוד', wrong: ['את המבנה המרכזי', 'מיקום או כמות', 'היעדר'], slide: 8, deck: TE },
    { id: 'te-dermatitis-dermatosis', q: 'מה ההבדל בין dermatitis ל-dermatosis?', a: 'dermatitis היא דלקת עור, dermatosis היא מחלת עור', wrong: ['dermatitis היא מחלת עור, dermatosis היא דלקת עור', 'שתיהן דלקת עור', 'dermatosis היא זיהום פטרייתי'], slide: 13, deck: TE },
    { id: 'te-pruritus-purpura', q: 'מה ההבדל בין pruritus ל-purpura?', a: 'pruritus הוא גרד, purpura היא דימום לתוך העור', wrong: ['pruritus הוא דימום, purpura היא גרד', 'שניהם גרד', 'שניהם דימום'], slide: 13, deck: TE },
    { id: 'te-intradermal', q: 'מה ההבדל בין intradermal ל-subcutaneous?', a: 'intradermal היא בתוך הדרמיס, subcutaneous היא מתחת לעור', wrong: ['intradermal היא מתחת לעור, subcutaneous היא בתוך הדרמיס', 'שתיהן מתחת לעור', 'שתיהן על פני העור'], slide: 13, deck: TE },

    // notes on the word-part slides
    { id: 'hidr-vs-hydr', q: 'מה ההבדל בין hidr/o ל-hydr/o?', a: 'hidr/o היא זיעה, hydr/o היא מים', wrong: ['hidr/o היא מים, hydr/o היא זיעה', 'שתיהן זיעה', 'שתיהן מים'], slide: 9 },
    { id: 'pilonidal-site', q: 'איפה מופיעה בדרך כלל ציסטה פילונידלית?', a: 'בעור באזור העצה (sacral region)', wrong: ['בקרקפת', 'בכף היד', 'מתחת לציפורן'], slide: 9 },
    { id: 'winter-itch', q: 'איזה מצב נקרא winter itch?', a: 'צורה קלה של ichthyosis', wrong: ['צורה קלה של psoriasis', 'סוג של scabies', 'אלרגיה לקור'], slide: 9 },
    { id: 'scleroderma-who', q: 'אצל מי scleroderma הכי שכיחה?', a: 'אצל נשים בגיל העמידה', wrong: ['אצל ילדים', 'אצל גברים צעירים', 'אצל תינוקות'], slide: 9 },
    { id: 'melanoma-origin', q: 'איפה מתחילה לרוב מלנומה?', a: 'בשומה כהה', wrong: ['בבלוטת זיעה', 'בזקיק שיער', 'מתחת לציפורן'], slide: 9 },
    { id: 'sebum', q: 'מהו sebum?', a: 'הפרשה שומנית של בלוטות החלב', wrong: ['זיעה', 'מוגלה', 'קשקשים של העור'], slide: 9 },
    { id: 'xeroderma-ichthyosis', q: 'מה הקשר בין xeroderma ל-ichthyosis?', a: 'xeroderma היא צורה קלה של ichthyosis', wrong: ['xeroderma היא צורה קשה של ichthyosis', 'אין קשר', 'xeroderma היא זיהום פטרייתי'], slide: 10 },

    // clinical terms
    { id: 'impetigo', q: 'מהו impetigo?', a: 'מחלת עור דלקתית עם פצעונים מוגלתיים שמתקרמים ונפתחים', wrong: ['כתמי עור לבנים', 'גרד עז בלי פריחה', 'עיבוי של האפידרמיס'], slide: 15 },
    { id: 'lentigo', q: 'מהו lentigo?', a: 'כתמים חומים קטנים באזורים שחשופים לשמש', wrong: ['דימום קטנטן מתחת לעור', 'אודם מהתרחבות נימים', 'כתמים לבנים'], slide: 15 },
    { id: 'pallor', q: 'מהו pallor?', a: 'חיוורון או היעדר צבע לא טבעי של העור', wrong: ['אודם של העור', 'הכחלה של העור', 'הצהבה של העור'], slide: 15 },
    { id: 'pediculosis', q: 'מהי pediculosis?', a: 'הדבקה בכינים', wrong: ['הדבקה בקרדית', 'זיהום פטרייתי', 'זיהום חיידקי של זקיק'], explain: 'עוברת במגע או בשימוש משותף במברשות, מסרקים או כיסויי ראש.', slide: 15 },
    { id: 'petechia', q: 'מהי petechia?', a: 'דימום זעיר, בגודל נקודה, מתחת לעור', wrong: ['חבורה גדולה', 'כתם לבן', 'פצעון מוגלתי'], explain: 'petechia היא גרסה קטנה של ecchymosis.', slide: 15 },
    { id: 'ecchymosis', q: 'מהי ecchymosis?', a: 'חבורה: אזור דימום גדול שמשנה צבע', wrong: ['דימום זעיר בגודל נקודה', 'אודם מהתרחבות נימים', 'כתם חום מהשמש'], explain: 'הצבע משתנה מכחול-שחור לחום-ירקרק או צהוב.', slide: 15 },
    { id: 'pruritus', q: 'מהו pruritus?', a: 'גרד עז', wrong: ['כאב חד', 'אודם', 'הזעת יתר'], slide: 15 },
    { id: 'psoriasis', q: 'מהי psoriasis?', a: 'מחלה כרונית עם כתמים אדומים מכוסים בקשקשים כסופים ועבים', wrong: ['זיהום פטרייתי של הציפורניים', 'הדבקה בקרדית', 'כתמים לבנים מאיבוד פיגמנט'], slide: 15 },
    { id: 'psoriasis-sites', q: 'איפה מופיעים בדרך כלל נגעי psoriasis?', a: 'בקרקפת, בברכיים, במרפקים, בטבור ובאיברי המין', wrong: ['רק בכפות הרגליים', 'רק בפנים', 'רק מתחת לציפורניים'], explain: 'נגעים חדשים נוטים להופיע במקומות של פציעה.', slide: 15 },
    { id: 'purpura', q: 'מהי purpura?', a: 'הפרעות דימום שגורמות לדימום בעור: חבורות ו-petechiae', wrong: ['זיהום פטרייתי', 'פריחה אלרגית', 'כתמים חומים מהשמש'], explain: 'הכתמים לא מחווירים כשלוחצים עליהם, ונעלמים תוך 2–3 שבועות.', slide: 15 },
    { id: 'scabies', q: 'מה גורם ל-scabies?', a: 'קרדית הגרד (itch mite)', wrong: ['כינים', 'פטרייה', 'וירוס'], explain: 'מופיעה בבתי השחי, באיברי המין, בירכיים הפנימיות ובין האצבעות, עם גרד עז.', slide: 15 },
    { id: 'tinea', q: 'מהי tinea?', a: 'מחלת עור פטרייתית, שנקראת לפי האזור בגוף', wrong: ['מחלת עור חיידקית', 'הדבקה בכינים', 'מחלה אוטואימונית'], explain: 'נקראת גם ringworm. דוגמאות מהמצגת: tinea barbae (זקן), tinea corporis (גוף), tinea pedis (כף הרגל), tinea versicolor ו-tinea cruris.', slide: 15 },
    { id: 'tinea-pedis', q: 'מהי tinea pedis?', a: "פטריית כף הרגל (athlete's foot)", wrong: ['פטריית הזקן', 'פטריית המפשעה', 'פטריית הגוף'], slide: 15 },
    { id: 'eczema', q: 'מהי eczema?', a: 'דלקת עור חריפה או כרונית עם אודם, שלפוחיות, קשקשים וגרד', wrong: ['דימום מתחת לעור', 'כתמים לבנים', 'הדבקה בכינים'], slide: 15 },
    { id: 'erythema', q: 'מהי erythema?', a: 'אודם של העור מנפיחות של הנימים', wrong: ['חיוורון של העור', 'עור יבש וקשקשי', 'גרד עז'], explain: 'דוגמה: כוויית שמש קלה או הסמקה.', slide: 15 },
    { id: 'eschar', q: 'מהו eschar?', a: 'רקמה פגועה אחרי כוויה קשה', wrong: ['פצעון מוגלתי', 'יבלת', 'כתם חום'], slide: 15 },
    { id: 'furuncle', q: 'מהו furuncle?', a: 'זיהום חיידקי מוגלתי של זקיק שיער או בלוטת חלב (boil)', wrong: ['זיהום פטרייתי של העור', 'יבלת ויראלית', 'כתם דימום'], slide: 15 },
    { id: 'hirsutism', q: 'מהו hirsutism?', a: 'צמיחת שיער מוגברת או במקומות לא רגילים, בעיקר אצל נשים', wrong: ['נשירת שיער', 'זיהום של זקיקי השיער', 'שיער שמאפיר'], slide: 15 },
    { id: 'urticaria', q: 'מהי urticaria?', a: 'תגובה אלרגית עם כתמים אדומים-חיוורים מורמים (hives)', wrong: ['כתמים לבנים מאיבוד פיגמנט', 'יבלות ויראליות', 'זיהום פטרייתי'], slide: 16 },
    { id: 'vitiligo', q: 'מהי vitiligo?', a: 'אובדן פיגמנט מקומי עם כתמים לבנים', wrong: ['כתמים חומים מהשמש', 'אודם של העור', 'עור יבש וקשקשי'], slide: 16 },
    { id: 'verruca', q: 'מהי verruca?', a: 'יבלת: גידול באפידרמיס שגורם וירוס', wrong: ['זיהום פטרייתי', 'דימום מתחת לעור', 'שומה כהה'], explain: 'מסירים אותה בהקפאה, בחשמל או בחומצות, אבל היא יכולה לחזור אם הנגיף נשאר בעור.', slide: 16 },

    // examples that rely on the terms above
    { id: 'pyoderma-example', q: 'מה דוגמה ל-pyoderma ראשונית?', a: 'impetigo', wrong: ['psoriasis', 'vitiligo', 'eczema'], slide: 10 },
    { id: 'cryotherapy-uses', q: 'במה מטפלים ב-cryotherapy (הקפאה בחנקן נוזלי)?', a: 'ביבלות וב-actinic keratosis', wrong: ['בפסוריאזיס', 'בכינים', 'בהזעת יתר'], slide: 10 },

    // describing lesions (second deck)
    { id: 'te-describe-lesion', q: 'מה מתארים בנגע עור?', a: 'מיקום ופיזור, גודל וצבע, צורה ומרקם, פני השטח ותסמינים נלווים', wrong: ['רק את הצבע', 'רק את הגודל', 'רק אם הוא כואב'], slide: 14, deck: TE },
    { id: 'te-macule', q: 'מהו macule?', a: 'כתם שטוח: שינוי צבע בלי הגבהה', wrong: ['נגע קטן מוגבה ומוצק', 'שלפוחית קטנה עם נוזל', 'נגע עמוק ומוצק'], slide: 15, deck: TE },
    { id: 'te-papule', q: 'מהו papule?', a: 'נגע קטן, מוצק ומוגבה', wrong: ['כתם שטוח', 'נגע עם מוגלה', 'שלפוחית גדולה'], slide: 15, deck: TE },
    { id: 'te-nodule', q: 'מהו nodule?', a: 'נגע מוצק עם רכיב עמוק', wrong: ['כתם שטוח גדול', 'שלפוחית קטנה', 'סדק בעור'], slide: 15, deck: TE },
    { id: 'te-patch-plaque', q: 'מה ההבדל בין patch ל-plaque?', a: 'patch הוא כתם שטוח רחב, plaque הוא נגע רחב שאפשר למשש', wrong: ['patch הוא נגע מוגבה, plaque הוא כתם שטוח', 'שניהם שלפוחיות', 'שניהם נגעים עמוקים'], slide: 16, deck: TE },
    { id: 'te-cyst', q: 'מהי cyst?', a: 'חלל עם תוכן נוזלי או חצי-מוצק', wrong: ['גוש מוצק', 'כתם שטוח', 'סדק בעור'], slide: 16, deck: TE },
    { id: 'te-vesicle-bulla', q: 'מה ההבדל בין vesicle ל-bulla?', a: 'vesicle היא שלפוחית קטנה, bulla היא שלפוחית גדולה', wrong: ['vesicle גדולה, bulla קטנה', 'vesicle עם מוגלה, bulla עם נוזל', 'אין הבדל'], slide: 17, deck: TE },
    { id: 'te-pustule', q: 'מהו pustule?', a: 'נגע שמכיל מוגלה', wrong: ['שלפוחית עם נוזל צלול', 'כתם שטוח', 'נפיחות מבצקת'], slide: 17, deck: TE },
    { id: 'te-wheal', q: 'מהו wheal?', a: 'נפיחות מבצקת מקומית, לרוב חולפת ומגרדת', wrong: ['שלפוחית עם מוגלה', 'כתם חום מהשמש', 'סדק בעור'], explain: 'urticaria (hives) מתבטאת ב-wheals.', slide: 18, deck: TE },
    { id: 'te-excoriation', q: 'מהי excoriation?', a: 'פגיעה שטחית מגירוד', wrong: ['סדק קווי בעור', 'פצע פתוח שמגיע לדרמיס', 'קשקשים של קרטין'], slide: 19, deck: TE },
    { id: 'te-fissure', q: 'מהו fissure?', a: 'סדק קווי בעור', wrong: ['פגיעה מגירוד', 'פצע פתוח עמוק', 'שלפוחית'], slide: 19, deck: TE },
    { id: 'te-ulcer', q: 'מהו ulcer?', a: 'פצע פתוח עם אובדן רקמה שמגיע לדרמיס', wrong: ['פגיעה שטחית מגירוד', 'סדק קווי', 'כתם שטוח'], slide: 19, deck: TE },
    { id: 'te-crust-scar', q: 'מה ההבדל בין crust ל-scar (cicatrix)?', a: 'crust הוא הפרשה מיובשת על פני העור, scar הוא רקמת תיקון סיבית אחרי החלמה', wrong: ['crust הוא רקמה סיבית, scar הוא הפרשה מיובשת', 'שניהם קשקשי קרטין', 'שניהם שלפוחיות'], slide: 20, deck: TE },
    { id: 'te-scale', q: 'מהו scale?', a: 'פתיתים של עור מקורן', wrong: ['הפרשה מיובשת', 'רקמת צלקת', 'שלפוחית קטנה'], slide: 20, deck: TE },
    { id: 'te-plural-bulla', q: 'מה צורת הרבים של bulla?', a: 'bullae', wrong: ['bullas', 'bulli', 'bullata'], explain: 'גם petechia ← petechiae, ו-macule ← macules.', slide: 31, deck: TE },

    // infections, burns and tumors (second deck)
    { id: 'te-albinism', q: 'מהו albinism?', a: 'ייצור מלנין לקוי או חסר', wrong: ['אובדן פיגמנט בכתמים לבנים', 'עודף מלנין', 'זיהום פטרייתי'], explain: 'ב-vitiligo יש אובדן פיגמנט מקומי.', slide: 22, deck: TE },
    { id: 'te-acne', q: 'איזה מבנה מעורב ב-acne vulgaris?', a: 'היחידה הפילוסבצאית (זקיק השיער ובלוטת החלב)', wrong: ['בלוטות הזיעה', 'הציפורניים', 'רקמת השומן התת-עורית'], explain: 'מאופיינת ב-comedones, papules ו-pustules.', slide: 22, deck: TE },
    { id: 'te-abscess', q: 'מהו abscess?', a: 'חלל מקומי שמכיל מוגלה', wrong: ['זיהום מתפשט של העור והרקמה התת-עורית', 'שלפוחית עם נוזל צלול', 'יבלת ויראלית'], slide: 23, deck: TE },
    { id: 'te-carbuncle', q: 'מה ההבדל בין furuncle ל-carbuncle?', a: 'furuncle הוא זיהום של זקיק אחד, carbuncle הוא אשכול של כמה', wrong: ['carbuncle הוא זקיק אחד, furuncle הוא אשכול', 'furuncle פטרייתי, carbuncle חיידקי', 'אין הבדל'], slide: 23, deck: TE },
    { id: 'te-cellulitis', q: 'מהי cellulitis?', a: 'זיהום מתפשט של העור והרקמה התת-עורית', wrong: ['חלל מקומי עם מוגלה', 'דלקת של תאי שומן בלבד', 'זיהום פטרייתי של הגוף'], slide: 23, deck: TE },
    { id: 'te-tinea-corporis', q: 'מהי tinea corporis?', a: 'זיהום פטרייתי של עור הגוף', wrong: ['זיהום פטרייתי של כף הרגל', 'זיהום פטרייתי של הציפורן', 'הדבקה בכינים'], slide: 24, deck: TE },
    { id: 'te-burn-depth', q: 'מהי כוויה בעובי חלקי (partial-thickness)?', a: 'פגיעה באפידרמיס ובחלק מהדרמיס', wrong: ['פגיעה באפידרמיס בלבד', 'פגיעה בכל הדרמיס', 'פגיעה בשומן בלבד'], explain: 'כוויה שטחית פוגעת רק באפידרמיס, וכוויה בעובי מלא מערבת את כל הדרמיס.', slide: 25, deck: TE },
    { id: 'te-neoplasm', q: 'מהו neoplasm?', a: 'גדילה של רקמה חדשה', wrong: ['גידול ממאיר בלבד', 'זיהום של רקמה', 'צלקת'], slide: 27, deck: TE },
    { id: 'te-in-situ', q: 'מהי carcinoma in situ?', a: 'קרצינומה שמוגבלת למקום שבו התחילה', wrong: ['קרצינומה ששלחה גרורות', 'גידול שפיר', 'זיהום במקום'], slide: 27, deck: TE },
    { id: 'te-metastasis', q: 'מהי metastasis?', a: 'התפשטות לאתר מרוחק', wrong: ['גידול שנשאר במקומו', 'גידול שפיר', 'נגע שטחי'], slide: 27, deck: TE },
    { id: 'te-oma', q: 'האם הסיומת -oma תמיד מציינת גידול ממאיר?', a: 'לא. היא סיומת של גידול, אבל לא תמיד ממאיר', wrong: ['כן, תמיד ממאיר', 'היא מציינת דלקת', 'היא מציינת זיהום'], explain: 'למשל lipoma (גידול שומני) לעומת melanoma (ממאיר).', slide: 27, deck: TE },

    // drugs
    { id: 'anesthetics', q: 'מה עושים חומרי הרדמה מקומית (anesthetics) לעור?', a: 'חוסמים תחושת כאב ומרדימים את העור והריריות', wrong: ['הורגים פטריות', 'מורידים דלקת וגרד', 'הורגים כינים וקרדית'], explain: 'דוגמאות מהמצגת: lidocaine, bupivacaine, procaine.', slide: 17 },
    { id: 'antifungals', q: 'איך פועלות תרופות נגד פטריות (antifungals)?', a: 'פוגעות בדופן התא של הפטרייה או באנזימים שלה', wrong: ['חוסמות היסטמין', 'מקלפות את השכבה העליונה של העור', 'מרדימות את העור'], explain: 'דוגמאות מהמצגת: clotrimazole, miconazole, nystatin, itraconazole.', slide: 17 },
    { id: 'antihistamines', q: 'מה עושים אנטיהיסטמינים לעור?', a: 'מפחיתים דלקת, אודם וגרד מתגובה אלרגית', wrong: ['הורגים חיידקים', 'מקלפים את העור', 'מרדימים את העור'], explain: 'דוגמאות מהמצגת: diphenhydramine, hydroxyzine. בשם נוסף: antipruritics.', slide: 17 },
    { id: 'antiseptics', q: 'מה עושים חומרי חיטוי (antiseptics)?', a: 'מעכבים צמיחת חיידקים בפצעים ובחתכים', wrong: ['מורידים דלקת', 'הורגים כינים', 'מקלפים יבלות'], explain: 'דוגמאות מהמצגת: chlorhexidine, אלכוהול, hydrogen peroxide.', slide: 17 },
    { id: 'corticosteroids', q: 'מה עושים קורטיקוסטרואידים לעור?', a: 'מפחיתים דלקת וגרד על ידי דיכוי מערכת החיסון', wrong: ['הורגים פטריות', 'הורגים כינים', 'מרדימים את העור'], explain: 'דוגמאות מהמצגת: hydrocortisone, triamcinolone.', slide: 17 },
    { id: 'steroid-suffixes', q: 'אילו סיומות נפוצות בשמות של קורטיקוסטרואידים?', a: '-sone, -olone, -onide', wrong: ['-azole, -statin, -cillin', '-caine, -mycin, -cycline', '-pril, -sartan, -olol'], explain: 'למשל hydrocortisone ו-triamcinolone.', slide: 17 },
    { id: 'keratolytics', q: 'מה עושים קרטוליטים (keratolytics)?', a: 'הורסים ומרככים את השכבה העליונה של העור כדי שתתקלף', wrong: ['מרדימים את העור', 'מגינים על העור בשכבה', 'הורגים קרדית'], explain: 'יעילים בהסרת יבלות (warts ו-corns). דוגמה מהמצגת: tretinoin.', slide: 17 },
    { id: 'parasiticides', q: 'במה מטפלים פרזיטיסידים (parasiticides)?', a: 'בקרדית (scabies) ובכינים (pediculosis)', wrong: ['בפטריות', 'בחיידקים', 'ביבלות'], explain: 'דוגמאות מהמצגת: permethrin, lindane.', slide: 17 },
    { id: 'protectives', q: 'מה עושים חומרי הגנה (protectives) לעור?', a: 'מכסים, מקררים, מייבשים או מרגיעים עור מודלק', wrong: ['חודרים לעור ומרככים אותו', 'הורגים חיידקים', 'מרדימים את העור'], explain: 'הם לא חודרים לעור, אלא יוצרים שכבה שמגינה עליו. דוגמאות: תחליבים, קרמים ומשחות.', slide: 17 },
    { id: 'lidocaine-class', q: 'לאיזו קבוצה שייכת lidocaine?', a: 'חומרי הרדמה מקומית (anesthetics)', wrong: ['תרופות נגד פטריות', 'אנטיהיסטמינים', 'קורטיקוסטרואידים'], slide: 17 },
    { id: 'clotrimazole-class', q: 'לאיזו קבוצה שייכת clotrimazole?', a: 'תרופות נגד פטריות (antifungals)', wrong: ['חומרי חיטוי', 'פרזיטיסידים', 'קרטוליטים'], slide: 17 },
    { id: 'permethrin-class', q: 'לאיזו קבוצה שייכת permethrin?', a: 'פרזיטיסידים (parasiticides)', wrong: ['אנטיהיסטמינים', 'תרופות נגד פטריות', 'קורטיקוסטרואידים'], slide: 17 },

    // diagnosis and treatment (second deck)
    { id: 'te-punch-shave', q: 'מה ההבדל בין punch biopsy ל-shave biopsy?', a: 'punch לוקחת דגימה גלילית קטנה, shave מגלחת דגימה שטחית', wrong: ['punch שטחית, shave גלילית', 'שתיהן מסירות את כל הנגע', 'אין הבדל'], slide: 28, deck: TE },
    { id: 'te-histology', q: 'מהי histology?', a: 'בדיקה מיקרוסקופית של רקמה', wrong: ['צילום רנטגן של העור', 'בדיקת דם', 'טיפול בהקפאה'], slide: 28, deck: TE },
    { id: 'te-debridement', q: 'מהו debridement?', a: 'הסרה של רקמה מתה (לא חיונית)', wrong: ['חתך וניקוז', 'השתלת עור', 'טיפול בהקפאה'], slide: 29, deck: TE },
    { id: 'te-excision', q: 'מהי excision?', a: 'הסרה כירורגית בחיתוך', wrong: ['פתיחה וניקוז של נגע', 'הקפאה', 'דגימה שטחית'], slide: 29, deck: TE },
    { id: 'te-topical-systemic', q: 'מה ההבדל בין טיפול topical ל-systemic?', a: 'topical פועל במקום, systemic פועל על כל הגוף', wrong: ['topical על כל הגוף, systemic במקום', 'שניהם במקום', 'שניהם דרך הפה בלבד'], slide: 30, deck: TE },
    { id: 'te-antipruritic', q: 'מה עושה תרופה antipruritic?', a: 'מקלה על גרד', wrong: ['פועלת נגד פטריות', 'מסירה קרטין', 'מורידה חום'], slide: 30, deck: TE },
    { id: 'te-case-excoriations', q: 'מטופל עם pruritus ו-excoriations: מה התסמין ומה הממצא?', a: 'pruritus (גרד) הוא התסמין, excoriations (פגיעות מגירוד) הן הממצא', wrong: ['excoriations הן התסמין, pruritus הוא הממצא', 'שניהם ממצאים', 'שניהם פעולות'], slide: 36, deck: TE },

    // abbreviations
    { id: 'abbr-bx', q: 'מה פירוש Bx?', a: 'biopsy (ביופסיה)', wrong: ['basal cell carcinoma', 'bedsore', 'burn'], slide: 18 },
    { id: 'abbr-bcc', q: 'מה פירוש BCC?', a: 'basal cell carcinoma', wrong: ['biopsy', 'bacterial cell culture', 'benign cyst carcinoma'], slide: 18 },
    { id: 'abbr-scc', q: 'מה פירוש SCC?', a: 'squamous cell carcinoma', wrong: ['sebaceous cell cyst', 'subcutaneous', 'skin care cream'], slide: 18 },
    { id: 'abbr-mm', q: 'מה פירוש MM?', a: 'malignant melanoma', wrong: ['multiple moles', 'Mohs micrographic surgery', 'mild melasma'], slide: 18 },
    { id: 'abbr-decub', q: 'מה פירוש decub?', a: 'decubitus: פצע לחץ (bedsore)', wrong: ['dermatology', 'decongestant', 'ביופסיה'], slide: 18 },
    { id: 'abbr-id', q: 'מה פירוש ID?', a: 'intradermal (בתוך העור)', wrong: ['incision and drainage', 'impression', 'infection disease'], slide: 18 },
    { id: 'abbr-id-drain', q: 'מה פירוש I&D?', a: 'incision and drainage (חתך וניקוז)', wrong: ['intradermal', 'injection and dressing', 'impression and diagnosis'], slide: 18 },
    { id: 'abbr-imp', q: 'מה פירוש IMP?', a: 'impression, כלומר אבחנה', wrong: ['implant', 'intramuscular', 'improvement'], slide: 18 },
    { id: 'abbr-subq', q: 'מה פירוש SubQ?', a: 'subcutaneous (תת-עורי)', wrong: ['sublingual', 'subungual', 'superficial'], slide: 18 },
    { id: 'abbr-ung', q: 'מה פירוש ung?', a: 'ointment (משחה)', wrong: ['ungual', 'urgent', 'unguided'], slide: 18 },
    { id: 'abbr-fs', q: 'מה פירוש FS?', a: 'frozen section', wrong: ['full skin', 'fungal smear', 'face scan'], slide: 18 },
    { id: 'abbr-xp', q: 'מה פירוש XP?', a: 'xeroderma pigmentosum', wrong: ['xerosis', 'x-ray picture', 'extra pigment'], slide: 18 },
    { id: 'abbr-mohs', q: 'מהו Mohs?', a: 'Mohs micrographic surgery: הסרה מדויקת של סרטן עור', wrong: ['טיפול בהקפאה', 'מקדם הגנה מהשמש', 'ביופסיה'], slide: 18 },
    { id: 'abbr-spf', q: 'מה פירוש SPF?', a: 'sun protection factor (מקדם הגנה מהשמש)', wrong: ['skin pigment factor', 'squamous papilloma', 'subcutaneous fat'], slide: 18 },
    { id: 'abbr-otc', q: 'מה פירוש OTC?', a: 'over-the-counter: ללא מרשם', wrong: ['ointment to cover', 'oral therapy course', 'only topical cream'], slide: 18 },
  ],
};

export default lecture;
