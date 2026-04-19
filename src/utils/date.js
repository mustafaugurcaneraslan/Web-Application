import { getLocale } from '../constants/i18n'

export function toDateKey(dateValue = new Date()) {
  const date = new Date(dateValue)
  return date.toISOString().slice(0, 10)
}

export function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  return !Number.isNaN(new Date(value).getTime())
}

export function normalizeDateKey(value, fallback = toDateKey()) {
  return isValidDateKey(value) ? value : fallback
}

export function getWeekKeys(anchorDateKey) {
  const days = []
  const base = new Date(anchorDateKey)

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(base)
    date.setDate(base.getDate() - index)
    days.push(toDateKey(date))
  }

  return days
}

export function getLastNDays(anchorDateKey, dayCount) {
  const base = new Date(anchorDateKey)
  const days = []

  for (let index = dayCount - 1; index >= 0; index -= 1) {
    const date = new Date(base)
    date.setDate(base.getDate() - index)
    days.push(toDateKey(date))
  }

  return days
}

export function formatShortDate(dateKey, language) {
  return new Date(dateKey).toLocaleDateString(getLocale(language), {
    month: 'short',
    day: 'numeric',
  })
}

export function formatLongDate(dateKey, language) {
  return new Date(dateKey).toLocaleDateString(getLocale(language), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
