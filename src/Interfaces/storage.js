export const SESSION_KEY = 'habit-tracker-session-v1'
export const THEME_STORAGE_KEY = 'habit-tracker-theme-v1'
export const LANGUAGE_STORAGE_KEY = 'habit-tracker-language-v1'

export function getHabitsStorageKey(userId) {
  return `habit-tracker-v1-${userId}`
}