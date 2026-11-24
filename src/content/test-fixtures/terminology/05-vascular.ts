import type { Lecture } from '../../types';

/** Lecture 5: the vascular system (vascular and endovascular surgery). Diagrams from the deck live in public/slides/vascular/. */
const IMG = '/slides/vascular';

const lecture: Lecture = {
  id: 'vascular',
  title: 'מערכת כלי הדם',
  source: 'Vascular and Endovascular Surgery 101 — Dr Hashem Hayeq (מצגת השיעור)',
  subtitle: 'אנטומיה, מחלות עורקים וורידים, מפרצות ו-EVAR',
  icon: '🩸',
  hue: 350,
  added: '2026-11-09',
  intro:
    'השיעור על כלי הדם, לפי המצגת. מתחילים במחזור הדם ובאנטומיה של העורקים והוורידים, ממשיכים למונחים ולקיצורים, ' +
    'לבדיקה ולהדמיה, ומסיימים במחלות העורקים, במפרצות אבי העורקים ובתיקון שלהן (EVAR ו-FEVAR), במחלות הוורידים ובמקרים הקליניים.',
  concepts: [
    {
      title: 'עורקים מול ורידים',
      body: 'עורקים מובילים דם מהלב: לחץ גבוה, שכבת media עבה ודופק שאפשר למשש. ורידים מחזירים דם ללב: לחץ נמוך, משמשים מאגר דם, ובגפיים יש בהם מסתמים.',
    },
    {
      title: 'שלוש שכבות בדופן העורק',
      body: 'מבפנים החוצה: intima (אנדותל), media (שריר חלק וסיבים אלסטיים) ו-adventitia (רקמת חיבור, עצבים ו-vasa vasorum). הרובד הטרשתי מתפתח בעיקר ב-intima.',
    },
    {
      title: 'ארבע קבוצות של PAD',
      body: 'מחלת עורקים היקפית מתחלקת לארבע: בלי תסמינים, כרונית עם תסמינים (למשל צליעה לסירוגין), איסכמיה כרונית שמאיימת על הגפה (CLTI), ואיסכמיה חריפה של הגפה (ALI).',
    },
    {
      title: '6 ה-P של איסכמיה חריפה',
      body: 'Pain (כאב), Pallor (חיוורון), Pulselessness (היעדר דופק), Paresthesia (נימול), Paralysis (שיתוק) ו-Poikilothermia (גפה קרה). זה מצב חירום.',
    },
    {
      title: 'מפרצת, דיסקציה ומפרצת כוזבת',
      body: 'מפרצת היא הרחבה של קטע בכלי הדם. בדיסקציה הדם מפריד בין שכבות הדופן דרך קרע ב-intima. מפרצת כוזבת (pseudoaneurysm) היא קרע בדופן שנשאר תחום, ולא הרחבה של שלוש השכבות.',
    },
    {
      title: 'EVAR: מנתקים, לא מוציאים',
      body: 'שתל סטנט מכוסה ומתפצל מוכנס דרך עורק הירך ויוצר ערוץ חדש לדם. הוא נאטם מעל המפרצת ומתחתיה, כך שהמפרצת מנותקת מהלחץ ולא מוסרת. לכן צריך מעקב הדמיה כל החיים.',
    },
  ],
  quiz: [
    {
      q: 'באיזו שכבה של דופן העורק מתפתח בעיקר הרובד הטרשתי?',
      options: ['intima', 'media', 'adventitia'],
      answer: 0,
    },
    {
      q: 'מה מבדיל צליעה לסירוגין מ-CLTI?',
      options: ['צליעה מופיעה במאמץ, ב-CLTI יש כאב במנוחה או נזק לרקמה', 'צליעה היא מצב חירום, CLTI לא', 'אין הבדל'],
      answer: 0,
    },
    {
      q: 'למה בוחרים FEVAR במקום EVAR רגיל?',
      options: ['כדי להיאטם ובו בזמן לשמור על זרימה לענפים כמו עורקי הכליה', 'כי הוא ניתוח פתוח', 'כי הוא לא צריך מעקב'],
      answer: 0,
    },
  ],
  words: [
    'arteritis', 'aortography', 'thrombectomy', 'embolectomy', 'endarterectomy', 'arteriotomy',
    'phlebectomy', 'thrombosis', 'embolism', 'infrarenal', 'fasciotomy', 'sclerotherapy',
  ],
  parts: ['infra', 'fasci', 'ism'],
  facts: [
    // circulation and anatomy
    { id: 'surgeon-treats', q: 'במה מטפל מנתח כלי דם?', a: 'בעורקים, בוורידים, בבעיות לימפה ובגישה לדיאליזה', wrong: ['רק בעורקים', 'רק בלב', 'רק בוורידים'], slide: 3 },
    { id: 'systemic-circuit', q: 'מה המסלול של מחזור הדם הגדול (הסיסטמי)?', a: 'חדר שמאלי ← אבי העורקים ← האיברים ← הוורידים הנבובים ← עלייה ימנית', wrong: ['חדר ימני ← עורקי הריאה ← הריאות ← ורידי הריאה ← עלייה שמאלית', 'עלייה שמאלית ← אבי העורקים ← הריאות ← חדר ימני', 'חדר שמאלי ← עורקי הריאה ← האיברים ← עלייה ימנית'], slide: 5 },
    { id: 'wall-layers', q: 'מה שלוש השכבות של דופן העורק?', a: 'intima, media ו-adventitia', wrong: ['epicardium, myocardium ו-endocardium', 'epidermis, dermis ו-hypodermis', 'intima, adventitia ו-pericardium'], img: `${IMG}/wall-layers.webp`, slide: 6 },
    { id: 'media-layer', q: 'ממה בנויה שכבת ה-media?', a: 'שריר חלק וסיבים אלסטיים', wrong: ['אנדותל', 'רקמת חיבור, עצבים ו-vasa vasorum', 'שומן'], img: `${IMG}/wall-layers.webp`, slide: 6 },
    { id: 'adventitia', q: 'מה יש בשכבת ה-adventitia?', a: 'רקמת חיבור, עצבים ו-vasa vasorum', wrong: ['אנדותל', 'שריר חלק בלבד', 'רובד טרשתי'], slide: 6 },
    { id: 'arch-branches', q: 'אילו שלושה עורקים יוצאים מקשת אבי העורקים?', a: 'brachiocephalic, left common carotid ו-left subclavian', wrong: ['right common carotid, left common carotid ו-left subclavian', 'brachiocephalic, celiac ו-left subclavian', 'right subclavian, right common carotid ו-brachiocephalic'], img: `${IMG}/aortic-arch.webp`, slide: 7 },
    { id: 'brachiocephalic', q: 'מה מספק ה-brachiocephalic trunk?', a: 'את המערכות הקרוטידית והסאבקלביאנית הימניות', wrong: ['את המערכות השמאליות', 'את הכליות', 'את המעיים'], img: `${IMG}/aortic-arch.webp`, slide: 7 },
    { id: 'ica', q: 'מה מספק העורק הקרוטידי הפנימי (ICA)?', a: 'את מחזור הדם בתוך הגולגולת', wrong: ['את הפנים והקרקפת', 'את היד', 'את בלוטת התריס בלבד'], img: `${IMG}/carotid.webp`, slide: 8 },
    { id: 'eca', q: 'מה מספק העורק הקרוטידי החיצוני (ECA)?', a: 'את הפנים והקרקפת', wrong: ['את המוח', 'את העין בלבד', 'את הריאות'], img: `${IMG}/carotid.webp`, slide: 8 },
    { id: 'carotid-bulb', q: 'איפה נוטה להיווצר רובד טרשתי בעורק הקרוטידי?', a: 'ב-carotid bulb, באזור ההתפצלות', wrong: ['ב-ECA בלבד', 'בקשת אבי העורקים', 'בוורידי הצוואר'], img: `${IMG}/carotid-neck.webp`, slide: 8 },
    { id: 'arteries-vs-veins', q: 'מה מאפיין ורידים בהשוואה לעורקים?', a: 'לחץ נמוך, משמשים מאגר דם ויש בהם מסתמים בגפיים', wrong: ['לחץ גבוה ושכבת media עבה', 'דופק שאפשר למשש', 'מובילים דם מהלב'], slide: 11 },
    { id: 'deep-veins', q: 'מה הוורידים העמוקים ברגל?', a: 'הוורידים הפמורליים, הפופליטאליים והטיביאליים', wrong: ['הוורידים הספניים הגדול והקטן', 'הוורידים המחוררים', 'הוורידים הנבובים'], img: `${IMG}/leg-veins.webp`, slide: 12 },
    { id: 'superficial-veins', q: 'מה הוורידים השטחיים ברגל?', a: 'הוורידים הספניים: הגדול (great) והקטן (small)', wrong: ['הוורידים הפמורליים', 'הוורידים הטיביאליים', 'הוורידים הפופליטאליים'], slide: 12 },
    { id: 'perforators', q: 'מה עושים הוורידים המחוררים (perforators)?', a: 'מחברים בין המערכת השטחית למערכת העמוקה', wrong: ['מחזירים דם ישירות ללב', 'מספקים דם לשריר', 'מחברים עורק לווריד'], slide: 12 },
    { id: 'calf-pump', q: 'מה מניע את החזרת הדם הוורידי מהרגל?', a: 'התכווצות שרירי השוק', wrong: ['הלחץ בעורקים', 'כוח המשיכה', 'התכווצות הוורידים עצמם'], slide: 12 },
    { id: 'arterioles', q: 'מה תפקיד העורקיקים (arterioles)?', a: 'מווסתים את ההתנגדות ומחלקים דם לנימים', wrong: ['מאפשרים חילוף חמצן', 'מחזירים דם ללב', 'אוגרים דם'], slide: 13 },
    { id: 'ischemia-def', q: 'מהי איסכמיה?', a: 'אספקת דם לא מספקת לצורכי הרקמה', wrong: ['קריש בווריד עמוק', 'הרחבה של עורק', 'דימום מעורק'], slide: 13 },
    { id: 'infrarenal-split', q: 'למה מתפצל אבי העורקים מתחת לעורקי הכליה?', a: 'לשני העורקים הכסליים המשותפים (common iliac)', wrong: ['לשני עורקי הכליה', 'לעורקים הקרוטידיים', 'ל-celiac ול-SMA'], img: `${IMG}/aorta.webp`, slide: 14 },
    { id: 'celiac', q: 'אילו ענפים יוצאים מה-celiac trunk?', a: 'left gastric, splenic ו-common hepatic', wrong: ['renal ו-mesenteric', 'common iliac ו-femoral', 'brachiocephalic ו-subclavian'], slide: 15 },
    { id: 'sma', q: 'מה מספק ה-superior mesenteric artery?', a: 'את רוב המעי הדק ואת המעי הגס הקרוב', wrong: ['את המעי הגס הרחוק והחלחולת', 'את הכליות', 'את הכבד בלבד'], slide: 15 },
    { id: 'ima', q: 'מה מספק ה-inferior mesenteric artery?', a: 'את המעי הגס הרחוק ואת החלק העליון של החלחולת', wrong: ['את רוב המעי הדק', 'את הכליות', 'את הקיבה'], slide: 15 },
    { id: 'leg-arteries', q: 'מה הרצף של עורקי הרגל?', a: 'common iliac ← external iliac ← common femoral ← superficial femoral ← popliteal', wrong: ['popliteal ← femoral ← iliac', 'common femoral ← external iliac ← popliteal', 'internal iliac ← popliteal ← femoral'], slide: 16 },

    // terminology
    { id: 'ectasia', q: 'מה פירוש הסיומת -ectasia?', a: 'הרחבה', wrong: ['היצרות', 'הוצאה', 'חתך'], slide: 18 },
    { id: 'gram-graphy', q: 'מה ההבדל בין -gram ל-graphy?', a: '-gram הוא התמונה או הרישום, -graphy היא פעולת הצילום', wrong: ['-gram היא פעולת הצילום, -graphy היא התמונה', 'שתיהן פירושן חתך', 'שתיהן פירושן תיקון'], slide: 18 },
    { id: 'angioplasty-def', q: 'מהי angioplasty?', a: 'הרחבה של כלי דם מוצר בעזרת צנתר', wrong: ['הסרת רובד בניתוח', 'היווצרות קריש', 'חתך בעורק'], slide: 19 },
    { id: 'abbr-pad', q: 'מה פירוש PAD?', a: 'peripheral artery disease', wrong: ['pulmonary artery disease', 'peripheral aneurysm disease', 'post-arterial dissection'], slide: 20 },
    { id: 'abbr-clti', q: 'מה פירוש CLTI?', a: 'chronic limb-threatening ischemia', wrong: ['carotid limb thrombosis', 'chronic lower thrombosis injury', 'critical lung tissue ischemia'], slide: 20 },
    { id: 'abbr-dsa', q: 'מה פירוש DSA?', a: 'digital subtraction angiography', wrong: ['duplex scan of arteries', 'deep saphenous artery', 'direct stent angioplasty'], slide: 20 },
    { id: 'abbr-cea', q: 'מה פירוש CEA?', a: 'carotid endarterectomy', wrong: ['carotid endovascular angioplasty', 'common external artery', 'chronic embolic arteritis'], slide: 20 },
    { id: 'abbr-evar', q: 'מה פירוש EVAR?', a: 'endovascular aneurysm repair', wrong: ['external vascular arterial repair', 'emergency venous artery repair', 'endovenous ablation'], slide: 21 },
    { id: 'abbr-taaa', q: 'מה פירוש TAAA?', a: 'thoracoabdominal aortic aneurysm', wrong: ['thoracic arterial access', 'total abdominal aortic angioplasty', 'transient arterial aneurysm'], slide: 21 },

    // history, exam and imaging
    { id: 'pulses', q: 'אילו דפקים ממששים בבדיקת כלי דם ברגל?', a: 'femoral, popliteal, dorsalis pedis ו-posterior tibial', wrong: ['radial ו-brachial', 'carotid בלבד', 'popliteal בלבד'], slide: 23 },
    { id: 'abi-formula', q: 'איך מחשבים ABI?', a: 'הלחץ הסיסטולי הגבוה בקרסול חלקי הלחץ הסיסטולי הגבוה בזרוע', wrong: ['הלחץ בזרוע חלקי הלחץ בקרסול', 'הלחץ הדיאסטולי בקרסול חלקי הדופק', 'הלחץ בקרסול פחות הלחץ בזרוע'], slide: 24 },
    { id: 'abi-abnormal', q: 'מאיזה ערך ABI נחשב לא תקין ותומך באבחנה של PAD?', a: '0.90 ומטה', wrong: ['1.2 ומעלה', '1.0 בדיוק', '0.5 ומטה בלבד'], slide: 24 },
    { id: 'abi-high', q: 'מה יכול להסביר ABI גבוה מאוד?', a: 'כלי דם מסוידים שלא נלחצים', wrong: ['כלי דם תקינים לגמרי', 'DVT', 'מפרצת'], explain: 'בסוכרת או במחלת כליות אפשר להיעזר בלחצים באצבעות הרגל.', slide: 24 },
    { id: 'color-doppler', q: 'מה מראה Color Doppler בבדיקת דופלקס?', a: 'את פיזור הזרימה ואת הכיוון שלה', wrong: ['את דופן כלי הדם בלבד', 'את מהירות הזרימה במספרים', 'את הסידן בדופן'], explain: 'B-mode מראה את הדופן, הרובד והחלל. Spectral Doppler מעריך מהירות.', slide: 25 },
    { id: 'mra-advantage', q: 'מה היתרון של MRA על CTA?', a: 'הדמיה של כלי דם בלי קרינה מייננת', wrong: ['מראה טוב יותר את הסידן', 'מאפשר טיפול מיידי', 'לא צריך חומר ניגוד אף פעם'], slide: 26 },
    { id: 'dsa-advantage', q: 'מה היתרון של צנתור אבחוני (DSA)?', a: 'מאפשר טיפול אנדווסקולרי מיידי', wrong: ['הוא לא פולשני', 'אין בו חומר ניגוד', 'אין בו קרינה'], slide: 26 },

    // arterial disease
    { id: 'plaque-start', q: 'מה מתחיל את היווצרות הרובד הטרשתי?', a: 'פגיעה באנדותל והצטברות שומנים', wrong: ['קריש בווריד', 'הרחבה של העורק', 'קרע ב-adventitia'], slide: 27 },
    { id: 'claudication', q: 'מהי צליעה לסירוגין (intermittent claudication)?', a: 'אי נוחות בשרירי הרגל במאמץ, שחוזרת ונרגעת במנוחה', wrong: ['כאב ברגל במנוחה', 'רגל נפוחה אחרי שכיבה ממושכת', 'כאב פתאומי עם רגל קרה'], slide: 29 },
    { id: 'claudication-site', q: 'כאב בשוק במאמץ מרמז בדרך כלל על מחלה באיזה אזור?', a: 'פמורו-פופליטאלי', wrong: ['כסלי (iliac)', 'קרוטידי', 'כלייתי'], explain: 'כאב בעכוז מרמז על מחלה באזור הכסלי.', slide: 29 },
    { id: 'pad-medical', q: 'מה הטיפול התרופתי הבסיסי ב-PAD?', a: 'סטטין בעוצמה גבוהה ונוגדי טסיות, עם הפסקת עישון ופעילות גופנית', wrong: ['ניתוח מיידי לכולם', 'משתנים בלבד', 'אנטיביוטיקה'], slide: 30 },
    { id: 'revascularize-claudication', q: 'מתי שוקלים פתיחת עורקים (revascularization) בצליעה?', a: 'כשהצליעה מגבילה את החיים למרות טיפול תרופתי ופעילות', wrong: ['תמיד, מיד באבחנה', 'אף פעם', 'רק אם ה-ABI תקין'], slide: 31 },
    { id: 'clti-def', q: 'מה מאפיין CLTI?', a: 'כאב במנוחה, נמק או כיב, עם מחלת עורקים מוכחת', wrong: ['כאב במאמץ בלבד', 'רגל נפוחה וכואבת', 'כאב פתאומי עם רגל קרה'], slide: 33 },
    { id: 'six-ps', q: 'מה זה Poikilothermia מתוך 6 ה-P?', a: 'גפה קרה', wrong: ['חיוורון', 'נימול', 'שיתוק'], slide: 34 },
    { id: 'ali-fasciotomy', q: 'מתי ייתכן שיהיה צורך ב-fasciotomy באיסכמיה חריפה?', a: 'אחרי איסכמיה ממושכת או אחרי החזרת זרימת הדם', wrong: ['לפני כל צנתור', 'רק בצליעה', 'אף פעם'], slide: 35 },
    { id: 'carotid-risk', q: 'מה עלול לגרום רובד בעורק הקרוטידי?', a: 'TIA או שבץ איסכמי מתסחיף', wrong: ['אוטם בשריר הלב', 'DVT', 'מפרצת בטנית'], slide: 36 },
    { id: 'carotid-first-test', q: 'מה בדיקת ההדמיה הראשונה בדרך כלל להיצרות קרוטידית?', a: 'אולטרסאונד דופלקס', wrong: ['CTA', 'צנתור', 'MRI מוח'], slide: 36 },
    { id: 'cea-vs-cas', q: 'מה ההבדל בין CEA ל-CAS?', a: 'CEA הוא ניתוח פתוח שמסיר את הרובד, CAS מכניס סטנט דרך צנתר', wrong: ['CEA דרך צנתר, CAS ניתוח פתוח', 'שניהם ניתוח פתוח', 'שניהם טיפול תרופתי'], slide: 37 },

    // aorta
    { id: 'aaa-def', q: 'מהי מפרצת של אבי העורקים הבטני (AAA)?', a: 'הרחבה קבועה של אבי העורקים בבטן', wrong: ['היצרות של אבי העורקים', 'קרע ב-intima', 'קריש באבי העורקים'], img: `${IMG}/aaa.webp`, slide: 39 },
    { id: 'aaa-location', q: 'איפה נמצאות רוב מפרצות אבי העורקים הבטני?', a: 'מתחת לעורקי הכליה (infrarenal)', wrong: ['בקשת אבי העורקים', 'בבית החזה', 'בעורקי הרגל'], slide: 39 },
    { id: 'dissection', q: 'מהי דיסקציה של אבי העורקים?', a: 'דם מפריד בין שכבות הדופן דרך קרע ב-intima', wrong: ['הרחבה של כל שלוש השכבות', 'קריש בתוך העורק', 'היצרות מרובד'], slide: 40 },
    { id: 'pseudoaneurysm', q: 'מהי מפרצת כוזבת (pseudoaneurysm)?', a: 'קרע תחום בדופן, לא הרחבה של שלוש השכבות', wrong: ['מפרצת אמיתית קטנה', 'דיסקציה', 'קריש בווריד'], slide: 40 },
    { id: 'aaa-surveillance', q: 'איך עוקבים בדרך כלל אחרי מפרצות קטנות בלי תסמינים?', a: 'באולטרסאונד', wrong: ['בצנתור', 'ב-MRI מוח', 'בבדיקת דם'], slide: 41 },
    { id: 'evar-how', q: 'איך מכניסים שתל ב-EVAR?', a: 'דרך עורק הירך (transfemoral)', wrong: ['דרך חתך גדול בבטן', 'דרך הווריד בצוואר', 'דרך הפה'], img: `${IMG}/evar-deploy.webp`, slide: 42 },
    { id: 'evar-surveillance', q: 'אחרי מה עוקבים אחרי EVAR?', a: 'endoleak ותזוזה של השתל (migration)', wrong: ['רמת הסוכר', 'קצב הלב', 'תפקוד הריאות'], slide: 42 },
    { id: 'evar-excluded', q: 'מה קורה למפרצת ב-EVAR?', a: 'היא מנותקת מהלחץ, ולא מוסרת', wrong: ['מוציאים אותה בניתוח', 'היא נסגרת בקריש מכוון', 'מרחיבים אותה'], img: `${IMG}/evar-graft.webp`, slide: 46 },
    { id: 'evar-first-step', q: 'מה השלב הראשון ב-EVAR?', a: 'CTA לפני הניתוח ומדידות', wrong: ['פריסת השתל', 'גישה לעורק הירך', 'אנגיוגרפיה בסוף'], slide: 47 },
    { id: 'landing-zone', q: 'מהו landing zone?', a: 'קטע של כלי דם בריא שבו השתל נאטם', wrong: ['המקום שבו המפרצת הכי רחבה', 'נקודת הכניסה של הצנתר', 'הענף שנחסם'], slide: 48 },
    { id: 'neck', q: 'מהו ה-neck ב-EVAR רגיל?', a: 'קטע אבי העורקים הלא מורחב שמתחת לעורקי הכליה', wrong: ['החלק הרחב ביותר של המפרצת', 'העורק הקרוטידי', 'עורק הירך'], slide: 48 },
    { id: 'endoleak', q: 'מהו endoleak?', a: 'זרימת דם שממשיכה מחוץ לשתל אבל בתוך שק המפרצת', wrong: ['דימום מעורק הירך', 'תזוזה של השתל', 'קריש בשתל'], slide: 48 },
    { id: 'endoleak-type2', q: 'מהו endoleak מסוג II?', a: 'זרימה הפוכה מענפים של כלי הדם', wrong: ['אטימה לא מספקת בקצוות', 'הפרדה בין חלקי השתל', 'נקבוביות של בד השתל'], slide: 49 },
    { id: 'endoleak-type1', q: 'מהו endoleak מסוג I?', a: 'אטימה לא מספקת בקצה העליון או התחתון', wrong: ['זרימה הפוכה מענפים', 'נקבוביות של השתל', 'הגדלה של השק בלי דליפה'], slide: 49 },
    { id: 'endotension', q: 'מהו endoleak מסוג V (endotension)?', a: 'שק המפרצת גדל בלי דליפה שאפשר לזהות', wrong: ['דליפה מענפים', 'קרע בבד השתל', 'אטימה לא מספקת'], slide: 49 },
    { id: 'evar-not-enough', q: 'מתי EVAR רגיל לא מספיק?', a: 'כשה-neck קצר או חסר, או כשהמפרצת מגיעה לעורקי הכליה', wrong: ['כשהמפרצת קטנה', 'כשהמטופל צעיר', 'כשיש צליעה'], slide: 50 },
    { id: 'fenestration', q: 'מהי fenestration ב-FEVAR?', a: 'פתח מדויק בבד השתל מול עורק מטרה', wrong: ['ענף שיוצא מהשתל', 'סוג של endoleak', 'חתך בעורק'], img: `${IMG}/fevar.webp`, slide: 51 },
    { id: 'bridging-stent', q: 'מה עושה bridging stent ב-FEVAR?', a: 'מחבר את הפתח בשתל לעורק המטרה ושומר אותו פתוח', wrong: ['אוטם את המפרצת מלמטה', 'מוציא את הקריש', 'מרחיב את עורק הירך'], slide: 52 },
    { id: 'fevar-bevar', q: 'מה ההבדל בין FEVAR ל-BEVAR?', a: 'ב-FEVAR יש פתחים בשתל, ב-BEVAR יש ענפים שיוצאים מהשתל', wrong: ['FEVAR ניתוח פתוח, BEVAR בצנתר', 'ב-FEVAR ענפים, ב-BEVAR פתחים', 'אין הבדל'], explain: 'FEVAR משמש לרוב במפרצות juxtarenal ו-pararenal, ו-BEVAR במפרצות TAAA נרחבות.', slide: 53 },
    { id: 'tevar-complications', q: 'מה סיבוכים אפשריים של TEVAR?', a: 'endoleak, שבץ ואיסכמיה של חוט השדרה', wrong: ['DVT בלבד', 'צליעה', 'דלקת עור'], slide: 54 },

    // veins and access
    { id: 'dvt-def', q: 'מהו DVT?', a: 'קריש במערכת הוורידים העמוקה', wrong: ['קריש בעורק הקרוטידי', 'דליות שטחיות', 'מפרצת בווריד'], slide: 58 },
    { id: 'dvt-test', q: 'איזו בדיקה משמשת לאבחון DVT?', a: 'אולטרסאונד בלחיצה (compression ultrasound)', wrong: ['CTA של אבי העורקים', 'ABI', 'אק"ג'], slide: 58 },
    { id: 'dvt-treatment', q: 'מה הטיפול העיקרי ברוב המטופלים עם DVT?', a: 'נוגדי קרישה', wrong: ['ניתוח מיידי', 'אנטיביוטיקה', 'גרביים בלבד'], slide: 58 },
    { id: 'pe-source', q: 'מאיפה מגיע בדרך כלל הקריש בתסחיף ריאתי (PE)?', a: 'מהוורידים העמוקים', wrong: ['מהעורק הקרוטידי', 'מאבי העורקים', 'מהוורידים השטחיים'], slide: 59 },
    { id: 'cvi', q: 'מה גורם לאי-ספיקה ורידית כרונית?', a: 'מסתמים לא תקינים או חסימה, שגורמים ללחץ דם גבוה בוורידים', wrong: ['רובד טרשתי בעורקים', 'זיהום פטרייתי', 'מפרצת'], explain: 'ממצאים: בצקת, פיגמנטציה של העור, אקזמה וכיבים ורידיים.', slide: 60 },
    { id: 'varicose-interventions', q: 'מהם טיפולים פולשניים בדליות?', a: 'צריבה תוך-ורידית, סקלרותרפיה ו-phlebectomy', wrong: ['EVAR ו-FEVAR', 'CEA', 'fasciotomy'], slide: 61 },
    { id: 'avf', q: 'מהי AVF (arteriovenous fistula)?', a: 'חיבור של עורק לווריד, לגישה לדיאליזה', wrong: ['קריש בווריד', 'שתל לתיקון מפרצת', 'מעקף עורקי'], explain: 'AVG (arteriovenous graft) משתמש בצינור מלאכותי.', slide: 62 },

    // cases
    { id: 'case1', q: 'מעשן בן 67 עם כאב בשוק אחרי 150 מטר הליכה, שחולף במנוחה. מה הבדיקה הראשונה?', a: 'ABI', wrong: ['CTA של הראש', 'אק"ג', 'צנתור מיידי'], explain: 'תמונה של צליעה לסירוגין מ-PAD.', slide: 64 },
    { id: 'case2', q: 'בן 74 עם כאב פתאומי חזק ונימול ברגל, כף רגל חיוורת וקרה בלי אות דופלר. מה האבחנה?', a: 'איסכמיה חריפה של הגפה (ALI)', wrong: ['DVT', 'צליעה לסירוגין', 'אי-ספיקה ורידית כרונית'], slide: 65 },
    { id: 'case5', q: 'שוק נפוחה בצד אחד אחרי שכיבה ממושכת: איזו אבחנה חייבים לשקול?', a: 'DVT', wrong: ['PAD', 'AAA', 'היצרות קרוטידית'], slide: 68 },
    { id: 'evar-purpose', q: 'מה המטרה של EVAR?', a: 'לנתק את שק המפרצת מהלחץ בעזרת שתל מכוסה', wrong: ['להוציא את המפרצת', 'להרחיב את אבי העורקים', 'לטפל בקריש בווריד'], slide: 71 },
  ],
};

export default lecture;
