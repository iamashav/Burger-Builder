export const ASAP = 'asap';

const SLOT_MINUTES = 30;
const PREP_MINUTES = 15;
const SLOT_COUNT = 6;

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** The next half-hour slots that still leave time to make the drinks. */
export function pickupSlots(now: Date): { value: string; label: string }[] {
  const first = new Date(now.getTime() + PREP_MINUTES * 60_000);
  first.setSeconds(0, 0);
  const remainder = first.getMinutes() % SLOT_MINUTES;
  if (remainder !== 0) first.setMinutes(first.getMinutes() + SLOT_MINUTES - remainder);

  const slots = Array.from({ length: SLOT_COUNT }, (_, index) => {
    const slot = new Date(first.getTime() + index * SLOT_MINUTES * 60_000);
    const time = formatTime(slot);
    return { value: time, label: time };
  });

  return [{ value: ASAP, label: `As soon as possible (~${PREP_MINUTES} min)` }, ...slots];
}
