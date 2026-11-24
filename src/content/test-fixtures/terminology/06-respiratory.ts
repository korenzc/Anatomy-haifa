import type { Lecture } from '../../types';

/** Lecture 6: the respiratory system. Diagrams from the deck live in public/slides/respiratory/. Facts are ordered so each idea is explained before it is used. */
const IMG = '/slides/respiratory';

const lecture: Lecture = {
  id: 'respiratory',
  title: 'מערכת הנשימה',
  source: 'Respiratory System — Anatomy and Terminology, Dr Bahaa Medlej (מצגת השיעור)',
  subtitle: 'אנטומיה של דרכי הנשימה, תסמינים, מחלות ובדיקות',
  icon: '🫁',
  hue: 195,
  added: '2026-11-23',
  intro:
    'השיעור על מערכת הנשימה, לפי המצגת. מתחילים באנטומיה, מהאף עד הנאדיות, ובאיך נושמים. ' +
    'אחר כך בונים את המילים, ואז עוברים לתסמינים, לקולות הנשימה, למחלות, לבדיקות, לניתוחים ולתרופות.',
  concepts: [
    {
      title: 'עליונה ותחתונה, הולכה וחילוף',
      body: 'דרכי הנשימה העליונות: האף, חלל האף, הסינוסים והלוע. התחתונות: הגרון, קנה הנשימה, הסימפונות והריאות. אזור ההולכה מעביר אוויר עד הסימפונונים הסופיים, ובאזור הנשימה, בנאדיות, מתחלפים הגזים.',
    },
    {
      title: 'הדרך של האוויר',
      body: 'אף ← לוע ← גרון ← קנה הנשימה ← הסימפונות הראשיים ← סימפונונים ← נאדיות. בנאדיות חמצן נכנס לדם ופחמן דו-חמצני יוצא ממנו.',
    },
    {
      title: 'שלוש סיומות חשובות',
      body: '-pnea היא נשימה (dyspnea, tachypnea). -ptysis היא השתעלות של משהו (hemoptysis, השתעלות דם). -thorax הוא חלל הפלאורה (pneumothorax, אוויר בחלל הפלאורה).',
      example: 'hemoptysis',
    },
    {
      title: 'hypoxemia או hypoxia?',
      body: 'hypoxemia היא חמצן נמוך בדם העורקי. hypoxia היא חוסר חמצן ברקמות. hypercapnia היא פחמן דו-חמצני גבוה בדם.',
      example: 'hypoxemia',
    },
    {
      title: 'צפצופים או סטרידור?',
      body: 'wheeze הוא צליל מוזיקלי, לרוב בנשיפה, ומרמז על היצרות של דרכי האוויר. stridor הוא צליל צורם, לרוב בשאיפה, ומרמז על חסימה בדרכי הנשימה העליונות.',
    },
    {
      title: 'תסמין, סימן ובדיקה',
      body: 'תסמין הוא מה שהמטופל מרגיש ומספר (dyspnea, שיעול). סימן הוא מה שהרופא מוצא בבדיקה (tachypnea, wheeze). בדיקה היא מה שמזמינים (oximetry, CXR).',
    },
  ],
  quiz: [
    {
      q: 'לאן שייך הגרון (larynx) לפי המצגת?',
      options: ['לדרכי הנשימה העליונות', 'לדרכי הנשימה התחתונות', 'לאזור הנשימה'],
      answer: 1,
      explain: 'לפי המוסכמה במצגת הגרון שייך לדרכים התחתונות, אבל יש סיווגים שונים.',
    },
    {
      q: 'מה פירוש hemoptysis?',
      options: ['השתעלות דם', 'דם בחלל הפלאורה', 'דימום מהאף', 'דם בשתן'],
      answer: 0,
    },
    {
      q: 'איזה צליל מרמז על חסימה בדרכי הנשימה העליונות?',
      options: ['stridor', 'wheeze', 'crackles'],
      answer: 0,
    },
  ],
  words: [
    'rhinitis', 'sinusitis', 'pharyngitis', 'laryngitis', 'tonsillitis', 'epiglottitis', 'laryngoscopy',
    'bronchoscopy', 'bronchiolitis', 'pneumothorax', 'hemothorax', 'pyothorax', 'pleuritis', 'tachypnea',
    'bradypnea', 'eupnea', 'orthopnea', 'hemoptysis', 'hypoxemia', 'hypoxia', 'hypercapnia', 'hypocapnia',
    'dysphonia', 'aphonia', 'anosmia', 'pneumoconiosis', 'lobectomy', 'pneumonectomy', 'tracheotomy',
    'thoracentesis', 'spirometry', 'oximeter', 'phrenic', 'bronchopneumonia',
  ],
  parts: [
    'eu', 'orth', 'rhin', 'nas', 'sinus', 'pharyng', 'laryng', 'tonsill', 'epiglott', 'bronchiol', 'pleur',
    'thorac', 'phren', 'spir', 'ox', 'coni', 'lob', 'ptysis', 'thorax', 'capnia', 'phonia', 'osmia', 'oxia', 'metry',
  ],
  facts: [
    // divisions and upper airway
    { id: 'upper-tract', q: 'מה כוללות דרכי הנשימה העליונות?', a: 'האף, חלל האף, הסינוסים והלוע', wrong: ['הגרון, קנה הנשימה והסימפונות', 'הריאות והנאדיות', 'קנה הנשימה והריאות'], img: `${IMG}/overview.webp`, slide: 3 },
    { id: 'lower-tract', q: 'מה כוללות דרכי הנשימה התחתונות?', a: 'הגרון, קנה הנשימה, הסימפונות והריאות', wrong: ['האף, הסינוסים והלוע', 'האף והלוע בלבד', 'הלוע והגרון בלבד'], slide: 3 },
    { id: 'conducting-zone', q: 'מה עושה אזור ההולכה (conducting zone)?', a: 'מעביר אוויר עד הסימפונונים הסופיים', wrong: ['מחליף גזים בנאדיות', 'מייצר את הקול', 'מסנן את הדם'], slide: 3 },
    { id: 'respiratory-zone', q: 'מה כולל אזור הנשימה (respiratory zone)?', a: 'סימפונונים נשימתיים, צינורות הנאדיות והנאדיות', wrong: ['קנה הנשימה והסימפונות הראשיים', 'האף והלוע', 'הגרון בלבד'], slide: 3 },
    { id: 'septum', q: 'מה מפריד בין חלל האף הימני לשמאלי?', a: 'מחיצת האף (septum)', wrong: ['הקונכיות (conchae)', 'החך הקשה', 'ה-choanae'], img: `${IMG}/nasal-cavity.webp`, slide: 5 },
    { id: 'conchae', q: 'מאיפה בולטות הקונכיות (conchae)?', a: 'מהדופן הצידית של חלל האף', wrong: ['ממחיצת האף', 'מרצפת חלל האף', 'מהלוע'], explain: 'מתחת לכל קונכייה יש meatus.', slide: 5 },
    { id: 'choanae', q: 'לאן נפתחים ה-choanae?', a: 'אל ה-nasopharynx', wrong: ['אל הגרון', 'אל הסינוסים', 'אל הפה'], explain: 'החך הקשה הוא רצפת חלל האף.', slide: 5 },
    { id: 'nasopharynx', q: 'מה נמצא ב-nasopharynx?', a: 'השקדים האדנואידים ופתחי חצוצרות השמיעה', wrong: ['השקדים הפלטיניים', 'הכניסה לגרון', 'מיתרי הקול'], slide: 6 },
    { id: 'oropharynx', q: 'מה מאפיין את ה-oropharynx?', a: 'יש בו את השקדים הפלטיניים ודרך משותפת לאוכל ולאוויר', wrong: ['יש בו פתחי חצוצרות השמיעה', 'הוא נמצא מאחורי הגרון', 'יש בו את מיתרי הקול'], slide: 6 },
    { id: 'laryngopharynx', q: 'איפה נמצא ה-laryngopharynx?', a: 'מאחורי הגרון, בדרך אל הוושט', wrong: ['מאחורי חלל האף', 'מאחורי חלל הפה', 'מתחת לקנה הנשימה'], slide: 6 },
    { id: 'sinuses', q: 'מה ארבעת הסינוסים הפאראנזליים?', a: 'frontal, ethmoidal, maxillary ו-sphenoidal', wrong: ['frontal, temporal, maxillary ו-occipital', 'maxillary ו-frontal בלבד', 'ethmoidal, parietal, nasal ו-sphenoidal'], img: `${IMG}/sinuses.webp`, slide: 7 },
    { id: 'maxillary-sinus', q: 'ליד מה נמצא הסינוס המקסילרי?', a: 'ליד השיניים העליונות האחוריות', wrong: ['ליד העין', 'ליד בסיס הגולגולת', 'ליד המצח'], slide: 7 },
    { id: 'rhinosinusitis', q: 'מהי rhinosinusitis?', a: 'דלקת שמערבת את רירית האף ואת רירית הסינוסים', wrong: ['דלקת של הסינוסים בלבד', 'דלקת של הלוע', 'דימום מהאף'], slide: 7 },

    // larynx, trachea, lungs
    { id: 'thyroid-cartilage', q: 'איזה סחוס יוצר את המגן הקדמי של הגרון?', a: 'הסחוס התירואידי (thyroid cartilage)', wrong: ['הסחוס הקריקואידי', 'הסחוסים האריטנואידיים', 'האפיגלוטיס'], img: `${IMG}/larynx.webp`, slide: 8 },
    { id: 'cricoid', q: 'מה מיוחד בסחוס הקריקואידי (cricoid)?', a: 'הוא טבעת שלמה מתחת לסחוס התירואידי', wrong: ['הוא מזיז את מיתרי הקול', 'הוא מכסה את הכניסה לגרון', 'הוא חצי טבעת'], slide: 8 },
    { id: 'arytenoids', q: 'מה מזיזים הסחוסים האריטנואידיים?', a: 'את מיתרי הקול', wrong: ['את האפיגלוטיס', 'את קנה הנשימה', 'את הלשון'], slide: 8 },
    { id: 'larynx-level', q: 'באיזה גובה נמצא הגרון אצל מבוגר?', a: 'בערך C3–C6', wrong: ['T4–T5', 'C1–C2', 'T1–T3'], slide: 8 },
    { id: 'false-cords', q: 'מה הם ה-vestibular folds?', a: 'הקפלים העליונים, מיתרי הקול הכוזבים', wrong: ['הקפלים שמרטטים ומפיקים קול', 'הפתח בין מיתרי הקול', 'האזור מתחת למיתרים'], img: `${IMG}/vocal-folds.webp`, slide: 9 },
    { id: 'true-cords', q: 'מה עושים מיתרי הקול האמיתיים (true vocal folds)?', a: 'מרטטים ומפיקים את הקול', wrong: ['סוגרים את הוושט', 'מסננים אבק', 'מייצרים ריר'], slide: 9 },
    { id: 'rima-glottidis', q: 'מהו rima glottidis?', a: 'הפתח בין מיתרי הקול האמיתיים', wrong: ['מיתרי הקול הכוזבים', 'האזור שמתחת למיתרים', 'הכניסה לוושט'], explain: 'ה-glottis כולל את מיתרי הקול האמיתיים ואת הפתח ביניהם.', slide: 9 },
    { id: 'stridor', q: 'מהו stridor?', a: 'צליל צורם מהיצרות בדרכי אוויר גדולות, לרוב בשאיפה', wrong: ['צליל מוזיקלי בנשיפה', 'פצפוצים בהאזנה', 'צלילים נמוכים מהפרשות'], explain: 'מרמז על חסימה בגרון או בקנה הנשימה.', slide: 11 },
    { id: 'trachea-start', q: 'איפה מתחיל קנה הנשימה?', a: 'בגבול התחתון של הסחוס הקריקואידי, בגובה C6', wrong: ['בגובה T4–T5', 'בגובה C1', 'בכניסה לגרון'], img: `${IMG}/bronchial-tree.webp`, slide: 12 },
    { id: 'carina', q: 'מהי ה-carina, ובאיזה גובה היא?', a: 'הרכס בהתפצלות קנה הנשימה, בערך T4–T5', wrong: ['תחילת קנה הנשימה, בגובה C6', 'קצה הריאה, בגובה T10', 'הסחוס התירואידי, בגובה C4'], slide: 12 },
    { id: 'right-bronchus', q: 'מה מאפיין את הסימפון הראשי הימני?', a: 'רחב יותר, קצר יותר ואנכי יותר', wrong: ['צר יותר וארוך יותר', 'אופקי יותר', 'זהה לשמאלי'], slide: 12 },
    { id: 'gas-exchange', q: 'מה קורה בנימים של הריאה?', a: 'חמצן נכנס לדם ופחמן דו-חמצני יוצא ממנו', wrong: ['פחמן דו-חמצני נכנס לדם', 'הדם מסונן מאבק', 'נוצר surfactant'], img: `${IMG}/alveoli.webp`, slide: 13 },
    { id: 'surfactant', q: 'מה עושה surfactant?', a: 'מוריד את מתח הפנים בנאדיות', wrong: ['מעביר חמצן לדם', 'מייצר ריר', 'מכווץ את הסימפונות'], slide: 13 },
    { id: 'lobes', q: 'כמה אונות יש לכל ריאה?', a: 'לימנית שלוש, לשמאלית שתיים', wrong: ['לשתיהן שלוש', 'לימנית שתיים, לשמאלית שלוש', 'לשתיהן שתיים'], img: `${IMG}/lobes.webp`, slide: 14 },
    { id: 'lingula', q: 'לאיזו אונה שייכת ה-lingula?', a: 'לאונה העליונה של הריאה השמאלית', wrong: ['לאונה האמצעית של הריאה הימנית', 'לאונה התחתונה של הריאה השמאלית', 'לאונה העליונה של הריאה הימנית'], slide: 14 },
    { id: 'cardiac-notch', q: 'מה מכילה ה-cardiac notch בריאה השמאלית?', a: 'את הלב', wrong: ['את הסרעפת', 'את קנה הנשימה', 'את הוושט'], slide: 14 },

    // breathing
    { id: 'inspiration', q: 'מה קורה לסרעפת בשאיפה?', a: 'מתכווצת ויורדת', wrong: ['נרפית ועולה', 'לא זזה', 'מתכווצת ועולה'], img: `${IMG}/breathing.webp`, slide: 20 },
    { id: 'quiet-expiration', q: 'מה מוציא את האוויר בנשיפה שקטה?', a: 'הרפיה וחזרה אלסטית של הריאות', wrong: ['התכווצות חזקה של הסרעפת', 'שרירי הבטן בלבד', 'ה-surfactant'], slide: 20 },
    { id: 'diffusion-perfusion', q: 'מה ההבדל בין דיפוזיה לפרפוזיה בריאה?', a: 'דיפוזיה היא מעבר גזים דרך הממברנה, פרפוזיה היא זרימת דם לנימי הריאה', wrong: ['דיפוזיה היא זרימת דם, פרפוזיה היא מעבר גזים', 'שתיהן תנועת אוויר', 'אין הבדל'], explain: 'ventilation היא תנועת האוויר פנימה והחוצה מהריאות.', slide: 21 },

    // word building
    { id: 'pneum-context', q: 'מה פירוש pneum/o?', a: 'אוויר או ריאה, לפי ההקשר', wrong: ['רק ריאה', 'רק אוויר', 'קרום הריאה'], explain: 'ב-pneumothorax זה אוויר, וב-pneumonia זו ריאה.', slide: 16 },
    { id: 'phren-diaphragm', q: 'מה פירוש phren/o בהקשר של מערכת הנשימה?', a: 'סרעפת', wrong: ['קרום הריאה', 'בית החזה', 'נשימה'], slide: 23 },
    { id: 'osmia', q: 'מה פירוש הסיומת -osmia?', a: 'חוש הריח', wrong: ['קול', 'נשימה', 'השתעלות'], slide: 25 },

    // symptoms and examination
    { id: 'dyspnea-def', q: 'מהי dyspnea לפי המצגת?', a: 'תחושה סובייקטיבית של קושי בנשימה', wrong: ['נשימה מהירה', 'הפסקת נשימה', 'נשימה תקינה'], slide: 17 },
    { id: 'productive-cough', q: 'מה ההבדל בין שיעול פרודוקטיבי לשיעול יבש?', a: 'בשיעול פרודוקטיבי יש ליחה, ביבש אין', wrong: ['ביבש יש ליחה, בפרודוקטיבי אין', 'בשניהם יש דם', 'אין הבדל'], slide: 30 },
    { id: 'epistaxis', q: 'מהו epistaxis?', a: 'דימום מהאף', wrong: ['השתעלות דם', 'דם בחלל הפלאורה', 'ליחה'], slide: 30 },
    { id: 'sputum', q: 'מהו sputum?', a: 'הפרשות מדרכי הנשימה התחתונות שיוצאות בשיעול', wrong: ['רוק מהפה', 'נוזל בחלל הפלאורה', 'דם מהאף'], slide: 30 },
    { id: 'wheeze', q: 'מהו wheeze (צפצוף)?', a: 'צליל מוזיקלי, לרוב בנשיפה, שמרמז על היצרות דרכי האוויר', wrong: ['צליל צורם בשאיפה מחסימה עליונה', 'פצפוצים לא רציפים', 'צלילים נמוכים מהפרשות'], slide: 31 },
    { id: 'crackles', q: 'מהם crackles (rales)?', a: 'צלילים לא רציפים, פצפוצים בהאזנה', wrong: ['צליל מוזיקלי בנשיפה', 'צליל צורם בשאיפה', 'צלילים נמוכים מהפרשות'], slide: 31 },
    { id: 'rhonchi', q: 'במה קשורים לרוב rhonchi?', a: 'בהפרשות בדרכי האוויר', wrong: ['בחסימה של הגרון', 'בנוזל בחלל הפלאורה', 'בהיצרות הסימפונות בלבד'], explain: 'אלה צלילים בטון נמוך.', slide: 31 },
    { id: 'auscultation', q: 'מה ההבדל בין auscultation ל-percussion?', a: 'auscultation היא האזנה, percussion היא הקשה', wrong: ['auscultation היא הקשה, percussion היא האזנה', 'שתיהן הסתכלות', 'שתיהן מישוש'], slide: 31 },

    // conditions
    { id: 'atelectasis', q: 'מהי atelectasis?', a: 'התנפחות חלקית או קריסה של רקמת הריאה', wrong: ['אוויר בחלל הפלאורה', 'נוזל בחלל הפלאורה', 'הרחבה של הסימפונות'], explain: 'ב-atelectasis מעורבת רקמת הריאה, וב-pneumothorax יש אוויר בחלל הפלאורה.', slide: 15 },
    { id: 'pleural-effusion', q: 'מהו pleural effusion?', a: 'עודף נוזל בחלל הפלאורה', wrong: ['אוויר בחלל הפלאורה', 'דם בחלל הפלאורה', 'נוזל בתוך הנאדיות'], slide: 15 },
    { id: 'empyema', q: 'מהי empyema?', a: 'מוגלה בחלל הפלאורה', wrong: ['דם בחלל הפלאורה', 'אוויר בחלל הפלאורה', 'דלקת קרום הריאה'], slide: 15 },
    { id: 'pulmonary-edema', q: 'מהי pulmonary edema?', a: 'נוזל ברקמת הריאה ובנאדיות', wrong: ['נוזל בחלל הפלאורה', 'מוגלה בחלל הפלאורה', 'אוויר ברקמת הריאה'], slide: 37 },
    { id: 'emphysema', q: 'מהי emphysema?', a: 'הרס של דפנות הנאדיות ואובדן הגמישות', wrong: ['הרחבה קבועה של הסימפונות', 'דלקת חריפה של הסימפונות', 'זיהום של רקמת הריאה'], img: `${IMG}/copd.webp`, slide: 34 },
    { id: 'chronic-bronchitis', q: 'מה מאפיין chronic bronchitis?', a: 'ייצור ריר מתמשך ודלקת בדרכי האוויר', wrong: ['הרס דפנות הנאדיות', 'כיווץ של שריר חלק בלבד', 'זיהום פטרייתי'], slide: 34 },
    { id: 'copd', q: 'מהי COPD?', a: 'חסימה מתמשכת של זרימת האוויר', wrong: ['זיהום חריף בריאה', 'מחלה תורשתית עם הפרשות סמיכות', 'מחלת ריאות מאבק'], explain: 'כוללת chronic bronchitis ו-emphysema.', slide: 34 },
    { id: 'asthma', q: 'מהי אסתמה?', a: 'דלקת כרונית בדרכי האוויר עם היצרות משתנה', wrong: ['הרס דפנות הנאדיות', 'זיהום של רקמת הריאה', 'הרחבה קבועה של הסימפונות'], img: `${IMG}/asthma.webp`, slide: 33 },
    { id: 'bronchospasm', q: 'מהו bronchospasm?', a: 'התכווצות של השריר החלק בדרכי האוויר', wrong: ['הרחבה של הסימפונות', 'ייצור ריר', 'קריסה של הריאה'], explain: 'exacerbation היא החמרה של התסמינים.', slide: 33 },
    { id: 'pneumonia-def', q: 'מהי דלקת ריאות (pneumonia) לפי המצגת?', a: 'זיהום של הנאדיות עם התמצקות (consolidation)', wrong: ['הרס דפנות הנאדיות', 'קריש בעורק הריאה', 'קריסת רקמת הריאה'], slide: 19 },
    { id: 'pertussis', q: 'מהו pertussis?', a: 'שעלת: זיהום חיידקי בדרכי הנשימה', wrong: ['זיהום ויראלי (שפעת)', 'מחלה תורשתית', 'מחלת ריאות מאבק'], slide: 35 },
    { id: 'cystic-fibrosis', q: 'מהי cystic fibrosis (CF)?', a: 'מחלה תורשתית של CFTR עם הפרשות סמיכות בכמה איברים', wrong: ['זיהום חיידקי בריאות', 'מחלה מאבק', 'צלקות בריאה מעישון'], slide: 36 },
    { id: 'pulmonary-fibrosis', q: 'מהי pulmonary fibrosis?', a: 'שינוי סיבי (צלקות) ברקמת הריאה', wrong: ['הרחבה של הסימפונות', 'נוזל בנאדיות', 'זיהום של הלוע'], slide: 36 },
    { id: 'ards', q: 'מהי ARDS?', a: 'נזק מפושט לנאדיות עם hypoxemia שלא מגיבה לטיפול', wrong: ['קריש בעורק הריאה', 'אוויר בחלל הפלאורה', 'דלקת כרונית בדרכי האוויר'], explain: 'ראשי התיבות: acute respiratory distress syndrome.', slide: 19 },
    { id: 'pe', q: 'מהו pulmonary embolism?', a: 'קריש שנתקע בעורק של הריאה', wrong: ['זיהום בנאדיות', 'נוזל בחלל הפלאורה', 'התכווצות הסימפונות'], slide: 19 },

    // tests and procedures
    { id: 'cxr', q: 'מה פירוש CXR?', a: 'צילום רנטגן של בית החזה', wrong: ['CT של בית החזה', 'תרבית ליחה', 'בדיקת שינה'], slide: 38 },
    { id: 'sputum-culture', q: 'מה בודקת תרבית ליחה (sputum culture)?', a: 'אם יש בליחה מיקרואורגניזמים', wrong: ['את רמת החמצן', 'את גודל הריאות', 'את הקול'], slide: 38 },
    { id: 'sweat-chloride', q: 'באבחנה של איזו מחלה תומכת בדיקת כלוריד בזיעה?', a: 'cystic fibrosis', wrong: ['אסתמה', 'COPD', 'שחפת'], slide: 38 },
    { id: 'intubation', q: 'מהי intubation?', a: 'הכנסת צינור דרך הגלוטיס אל קנה הנשימה', wrong: ['פתח ניתוחי בקנה הנשימה', 'ניקור של בית החזה', 'בדיקת הסימפונות בסקופ'], slide: 19 },
    { id: 'tracheotomy-stomy', q: 'מה ההבדל בין tracheotomy ל-tracheostomy?', a: 'tracheotomy היא חתך בקנה הנשימה, tracheostomy היא יצירת פתח קבוע בו', wrong: ['tracheotomy היא פתח, tracheostomy היא חתך', 'שתיהן הוצאה של קנה הנשימה', 'אין הבדל'], slide: 41 },
    { id: 'thoracentesis-purpose', q: 'מה שתי המטרות של thoracentesis?', a: 'אבחון (דגימת נוזל) וטיפול (הוצאת נוזל להקלה)', wrong: ['רק אבחון', 'רק טיפול', 'הכנסת אוויר לחלל הפלאורה'], img: `${IMG}/thoracentesis.webp`, slide: 40 },
    { id: 'septoplasty', q: 'מהי septoplasty?', a: 'תיקון ניתוחי של מחיצת האף', wrong: ['הוצאת אונה של הריאה', 'פתח בקנה הנשימה', 'ניקור של בית החזה'], slide: 41 },
    { id: 'bronchodilator', q: 'מה עושה מרחיב סימפונות (bronchodilator)?', a: 'מרפה את השריר החלק ומרחיב את דרכי האוויר', wrong: ['מדכא שיעול', 'עוזר להוציא ליחה', 'מפחית תגובה אלרגית'], slide: 42 },
    { id: 'antitussive-expectorant', q: 'מה ההבדל בין antitussive ל-expectorant?', a: 'antitussive מדכא שיעול, expectorant עוזר להוציא ליחה', wrong: ['antitussive עוזר להוציא ליחה, expectorant מדכא שיעול', 'שניהם מרחיבים סימפונות', 'שניהם אנטיביוטיקה'], slide: 42 },

    // the clinical note
    { id: 'note-signs', q: 'במקרה מהמצגת: אילו מהממצאים הם סימנים קליניים?', a: 'tachypnea ו-wheeze', wrong: ['dyspnea ושיעול פרודוקטיבי', 'oximetry ו-CXR', 'כולם תסמינים'], explain: 'dyspnea ושיעול הם תסמינים שהמטופל מספר, ו-oximetry ו-CXR הן בדיקות.', slide: 47 },
  ],
};

export default lecture;
