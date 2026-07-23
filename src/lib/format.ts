/** Strips any "#N" / "| suffix" tail so only the flag + country name remains,
 *  e.g. "🇷🇺 Россия #1 | Happ only" → "🇷🇺 Россия". */
export function cleanBaseName(name: string): string {
  return name.replace(/\s*(#\d+|\|).*$/, '').trim()
}

/** Formats a millisecond duration as a short Russian string, e.g. "12 мин",
 *  "1 ч 5 мин", "2 дн 3 ч". Coarsens to the two largest units. */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.round(ms / 60000))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return hours > 0 ? `${days} дн ${hours} ч` : `${days} дн`
  if (hours > 0) return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`
  return `${minutes} мин`
}
