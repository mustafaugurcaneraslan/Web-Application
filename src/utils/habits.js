import { TEXT, WEEKDAY_SHORT_LABELS } from '../constants/i18n'
import { formatShortDate, isValidDateKey, toDateKey } from './date'

export function getStreak(history, fromDateKey) {
  if (!isValidDateKey(fromDateKey)) {
    return 0
  }

  let streak = 0
  const cursor = new Date(fromDateKey)

  while (true) {
    const key = toDateKey(cursor)
    if (!history[key]) {
      break
    }
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function getBestStreak(history) {
  const activeDates = Object.keys(history)
    .filter((key) => history[key])
    .sort((a, b) => a.localeCompare(b))

  let best = 0
  let current = 0
  let previous = null

  activeDates.forEach((key) => {
    if (!previous) {
      current = 1
      best = 1
      previous = key
      return
    }

    const previousDate = new Date(previous)
    previousDate.setDate(previousDate.getDate() + 1)
    const expected = toDateKey(previousDate)

    current = expected === key ? current + 1 : 1
    best = Math.max(best, current)
    previous = key
  })

  return best
}

export function normalizeHabit(habit) {
  const fallbackDate = habit.createdAt ? toDateKey(habit.createdAt) : toDateKey()
  const fallbackWeekday = new Date(habit.startDate ?? fallbackDate).getDay()
  const normalizedWeeklyDays = Array.isArray(habit.weeklyDays)
    ? habit.weeklyDays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    : []

  return {
    ...habit,
    recurrence: habit.recurrence ?? 'daily',
    startDate: habit.startDate ?? fallbackDate,
    weeklyDay: Number.isInteger(habit.weeklyDay) ? habit.weeklyDay : fallbackWeekday,
    weeklyDays:
      normalizedWeeklyDays.length > 0
        ? [...new Set(normalizedWeeklyDays)].sort((a, b) => a - b)
        : [Number.isInteger(habit.weeklyDay) ? habit.weeklyDay : fallbackWeekday],
  }
}

export function isHabitScheduledForDate(habit, dateKey) {
  const recurrence = habit.recurrence ?? 'daily'
  const startDate = habit.startDate ?? toDateKey(habit.createdAt ?? Date.now())
  const weeklyDay = Number.isInteger(habit.weeklyDay)
    ? habit.weeklyDay
    : new Date(startDate).getDay()
  const weeklyDays = Array.isArray(habit.weeklyDays) && habit.weeklyDays.length > 0
    ? habit.weeklyDays
    : [weeklyDay]

  if (dateKey < startDate) {
    return false
  }

  if (recurrence === 'one-time') {
    return dateKey === startDate
  }

  if (recurrence === 'weekly') {
    return weeklyDays.includes(new Date(dateKey).getDay())
  }

  return true
}

export function getCompletionPercent(habits, dayKeys) {
  if (habits.length === 0 || dayKeys.length === 0) {
    return 0
  }

  let totalSlots = 0
  let completedSlots = 0

  dayKeys.forEach((key) => {
    const scheduled = habits.filter((habit) => isHabitScheduledForDate(habit, key))
    totalSlots += scheduled.length
    completedSlots += scheduled.filter((habit) => habit.history?.[key]).length
  })

  if (totalSlots === 0) {
    return 0
  }

  return Math.round((completedSlots / totalSlots) * 100)
}

export function recurrenceLabel(habit, language) {
  const text = TEXT[language] ?? TEXT.en

  if (habit.recurrence === 'one-time') {
    return `${text.oneTimeLabel} • ${formatShortDate(habit.startDate, language)}`
  }

  if (habit.recurrence === 'weekly') {
    const weeklyDays = Array.isArray(habit.weeklyDays) && habit.weeklyDays.length > 0
      ? [...new Set(habit.weeklyDays)].sort((a, b) => a - b)
      : [
          Number.isInteger(habit.weeklyDay)
            ? habit.weeklyDay
            : new Date(habit.startDate).getDay(),
        ]

    const labels = weeklyDays
      .map((dayValue) => WEEKDAY_SHORT_LABELS[language]?.[dayValue] ?? WEEKDAY_SHORT_LABELS.en[dayValue])
      .filter(Boolean)

    return `${text.weeklyLabel} • ${labels.join(', ')}`
  }

  return `${text.dailyLabel} • ${text.starts} ${formatShortDate(habit.startDate, language)}`
}

export function hexToRgba(hex, alpha) {
  const value = hex.replace('#', '')
  const normalized = value.length === 3
    ? value
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : value

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
