/** Sending material to Koren, who adds it to the app for everyone. */

const KOREN_WHATSAPP = '972529551633';

const MESSAGE = 'היי, אשמח שתעלה לאפליקציה את הקובץ שאני מצרף/ת עכשיו בהודעה, תודה!';

/** Opens WhatsApp (app on the phone, web on a computer) with the message ready; the student attaches the file. */
export const sendMaterialLink = (courseTitle?: string) =>
  `https://wa.me/${KOREN_WHATSAPP}?text=${encodeURIComponent(courseTitle ? `${MESSAGE} (${courseTitle})` : MESSAGE)}`;
