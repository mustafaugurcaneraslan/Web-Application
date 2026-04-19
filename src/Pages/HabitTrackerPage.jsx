import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../Components/EmptyState'
import HabitCard from '../Components/HabitCard'
import HeroPanel from '../Components/HeroPanel'
import ProfilePanel from '../Components/ProfilePanel'
import SettingsPanel from '../Components/SettingsPanel'
import { getHabitsStorageKey, LANGUAGE_STORAGE_KEY, SESSION_KEY, THEME_STORAGE_KEY } from '../Interfaces/storage'
import { TEXT, WEEKDAY_LABELS, getLocale } from '../constants/i18n'
import { WEEKDAY_OPTIONS } from '../constants/habits'
import { ACCENT_COLORS, THEME_OPTIONS } from '../constants/themes'
import { getLastNDays, getWeekKeys, toDateKey } from '../utils/date'
import {
  getCompletionPercent,
  getStreak,
  isHabitScheduledForDate,
  normalizeHabit,
} from '../utils/habits'
import '../App.css'

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState([])
  const [habitName, setHabitName] = useState('')
  const [habitColor, setHabitColor] = useState(ACCENT_COLORS[0])
  const [habitRecurrence, setHabitRecurrence] = useState('daily')
  const [habitWeeklyDays, setHabitWeeklyDays] = useState([new Date().getDay()])
  const [sortMode, setSortMode] = useState('newest')
  const [editingHabitId, setEditingHabitId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [editingWeeklyDays, setEditingWeeklyDays] = useState([])
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [theme, setTheme] = useState('cotton-candy')
  const [isThemeHydrated, setIsThemeHydrated] = useState(false)
  const [language, setLanguage] = useState('en')
  const [isLanguageHydrated, setIsLanguageHydrated] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState('theme')
  const [currentUser, setCurrentUser] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileTab, setProfileTab] = useState('login')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authStatus, setAuthStatus] = useState({ type: '', message: '' })
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const parsedSession = JSON.parse(session)
        if (parsedSession?.id && parsedSession?.email) {
          const key = getHabitsStorageKey(parsedSession.id)
          try {
            const cached = localStorage.getItem(key)
            if (cached) {
              const parsed = JSON.parse(cached)
              if (Array.isArray(parsed)) {
                setHabits(parsed.map(normalizeHabit))
              }
            }
          } catch {
          }
          setCurrentUser(parsedSession)
        }
      }
    } catch {
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    try {
      const cachedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      const validTheme = THEME_OPTIONS.some((option) => option.value === cachedTheme)
      if (validTheme) {
        setTheme(cachedTheme)
      }
    } catch {
      setTheme('cotton-candy')
    } finally {
      setIsThemeHydrated(true)
    }
  }, [])

  useEffect(() => {
    try {
      const cachedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      const validLanguage = LANGUAGE_OPTIONS.some((option) => option.value === cachedLanguage)
      if (validLanguage) {
        setLanguage(cachedLanguage)
      }
    } catch {
      setLanguage('en')
    } finally {
      setIsLanguageHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || !currentUser) {
      return
    }
    localStorage.setItem(getHabitsStorageKey(currentUser.id), JSON.stringify(habits))
  }, [habits, isHydrated, currentUser])

  useEffect(() => {
    if (!isThemeHydrated) {
      return
    }
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme, isThemeHydrated])

  useEffect(() => {
    if (!isLanguageHydrated) {
      return
    }
    document.documentElement.lang = language
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language, isLanguageHydrated])

  const todayKey = toDateKey()
  const text = TEXT[language] ?? TEXT.en
  const locale = getLocale(language)
  const recurrenceOptions = [
    { value: 'one-time', label: text.recurrenceOneTime },
    { value: 'daily', label: text.recurrenceDaily },
    { value: 'weekly', label: text.recurrenceWeekly },
  ]

  const stats = useMemo(() => {
    const total = habits.length
    const scheduledToday = habits.filter((habit) => isHabitScheduledForDate(habit, todayKey))
    const completedToday = scheduledToday.filter((habit) => habit.history?.[todayKey]).length
    const completionRate =
      scheduledToday.length === 0
        ? 0
        : Math.round((completedToday / scheduledToday.length) * 100)
    const weekKeys = getWeekKeys(todayKey)

    const weekRatio = weekKeys.map((key) => {
      if (total === 0) {
        return { key, percent: 0 }
      }
      const scheduled = habits.filter((habit) => isHabitScheduledForDate(habit, key))
      if (scheduled.length === 0) {
        return { key, percent: 0 }
      }
      const doneCount = scheduled.filter((habit) => habit.history?.[key]).length
      return { key, percent: Math.round((doneCount / scheduled.length) * 100) }
    })

    const monthKeys = getLastNDays(todayKey, 30)
    const monthRatio = monthKeys.map((key) => {
      if (total === 0) {
        return { key, percent: 0 }
      }
      const scheduled = habits.filter((habit) => isHabitScheduledForDate(habit, key))
      if (scheduled.length === 0) {
        return { key, percent: 0 }
      }
      const doneCount = scheduled.filter((habit) => habit.history?.[key]).length
      return { key, percent: Math.round((doneCount / scheduled.length) * 100) }
    })

    const thisWeek = getLastNDays(todayKey, 7)
    const previousWeekAnchor = new Date(todayKey)
    previousWeekAnchor.setDate(previousWeekAnchor.getDate() - 7)
    const previousWeek = getLastNDays(toDateKey(previousWeekAnchor), 7)
    const thisWeekPercent = getCompletionPercent(habits, thisWeek)
    const previousWeekPercent = getCompletionPercent(habits, previousWeek)
    const trend = thisWeekPercent - previousWeekPercent

    return {
      total,
      completedToday,
      completionRate,
      weekRatio,
      monthRatio,
      monthAverage: getCompletionPercent(habits, monthKeys),
      trend,
    }
  }, [habits, todayKey])

  const sortedHabits = useMemo(() => {
    const list = [...habits]

    if (sortMode === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name, locale))
    }

    if (sortMode === 'streak') {
      return list.sort((a, b) => {
        const aStreak = getStreak(a.history ?? {}, todayKey)
        const bStreak = getStreak(b.history ?? {}, todayKey)
        return bStreak - aStreak
      })
    }

    if (sortMode === 'completion') {
      return list.sort((a, b) => {
        const aTotal = Object.values(a.history ?? {}).filter(Boolean).length
        const bTotal = Object.values(b.history ?? {}).filter(Boolean).length
        return bTotal - aTotal
      })
    }

    return list.sort((a, b) => b.createdAt - a.createdAt)
  }, [habits, sortMode, locale, todayKey])

  const todayHabits = useMemo(
    () => sortedHabits.filter((habit) => isHabitScheduledForDate(habit, todayKey)),
    [sortedHabits, todayKey],
  )

  const otherHabits = useMemo(
    () => sortedHabits.filter((habit) => !isHabitScheduledForDate(habit, todayKey)),
    [sortedHabits, todayKey],
  )

  const addHabit = () => {
    const cleaned = habitName.trim()
    if (!cleaned) {
      return
    }

    const newHabit = {
      id: crypto.randomUUID(),
      name: cleaned,
      color: habitColor,
      recurrence: habitRecurrence,
      startDate: todayKey,
      weeklyDay: habitRecurrence === 'weekly' ? habitWeeklyDays[0] ?? new Date(todayKey).getDay() : null,
      weeklyDays: habitRecurrence === 'weekly' ? [...habitWeeklyDays].sort((a, b) => a - b) : [],
      createdAt: Date.now(),
      history: {},
    }

    setHabits((prev) => [newHabit, ...prev])
    setHabitName('')
    setHabitRecurrence('daily')
    setHabitWeeklyDays([new Date(todayKey).getDay()])
    setIsAddOpen(false)
  }

  const toggleWeeklySelection = (dayValue) => {
    setHabitWeeklyDays((prev) => {
      if (prev.includes(dayValue)) {
        if (prev.length === 1) {
          return prev
        }
        return prev.filter((value) => value !== dayValue)
      }

      return [...prev, dayValue].sort((a, b) => a - b)
    })
  }

  const toggleHabit = (habitId) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) {
          return habit
        }

        if (!isHabitScheduledForDate(habit, todayKey)) {
          return habit
        }

        const updatedHistory = { ...habit.history }
        if (updatedHistory[todayKey]) {
          delete updatedHistory[todayKey]
        } else {
          updatedHistory[todayKey] = true
        }

        return {
          ...habit,
          history: updatedHistory,
        }
      }),
    )
  }

  const removeHabit = (habitId) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId))
    setConfirmDeleteId((currentId) => (currentId === habitId ? null : currentId))
    if (editingHabitId === habitId) {
      setEditingHabitId(null)
      setEditingName('')
    }
  }

  const requestDeleteHabit = (habitId) => {
    setConfirmDeleteId(habitId)
  }

  const cancelDeleteHabit = () => {
    setConfirmDeleteId(null)
  }

  const startEditing = (habit) => {
    setEditingHabitId(habit.id)
    setEditingName(habit.name)
    const weeklyDays = Array.isArray(habit.weeklyDays) && habit.weeklyDays.length > 0
      ? [...new Set(habit.weeklyDays)].sort((a, b) => a - b)
      : [
          Number.isInteger(habit.weeklyDay)
            ? habit.weeklyDay
            : new Date(habit.startDate).getDay(),
        ]
    setEditingWeeklyDays(weeklyDays)
  }

  const toggleEditingWeeklySelection = (dayValue) => {
    setEditingWeeklyDays((prev) => {
      if (prev.includes(dayValue)) {
        if (prev.length === 1) {
          return prev
        }
        return prev.filter((value) => value !== dayValue)
      }

      return [...prev, dayValue].sort((a, b) => a - b)
    })
  }

  const saveEditing = () => {
    const cleaned = editingName.trim()
    if (!cleaned || !editingHabitId) {
      return
    }

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== editingHabitId) {
          return habit
        }

        return {
          ...habit,
          name: cleaned,
          weeklyDay:
            habit.recurrence === 'weekly'
              ? editingWeeklyDays[0] ?? habit.weeklyDay ?? new Date(habit.startDate).getDay()
              : habit.weeklyDay,
          weeklyDays:
            habit.recurrence === 'weekly'
              ? [...new Set(editingWeeklyDays)].sort((a, b) => a - b)
              : habit.weeklyDays,
        }
      }),
    )
    setEditingHabitId(null)
    setEditingName('')
    setEditingWeeklyDays([])
  }

  const cancelEditing = () => {
    setEditingHabitId(null)
    setEditingName('')
    setEditingWeeklyDays([])
  }

  const toggleSettingsPanel = () => {
    setIsSettingsOpen((prev) => {
      const next = !prev
      if (next) {
        setIsAddOpen(false)
        setIsProfileOpen(false)
      }
      return next
    })
  }

  const toggleAddPanel = () => {
    setIsAddOpen((prev) => {
      const next = !prev
      if (next) {
        setIsSettingsOpen(false)
        setIsProfileOpen(false)
      }
      return next
    })
  }

  const openUserSession = (user) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    try {
      const cached = localStorage.getItem(getHabitsStorageKey(user.id))
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          setHabits(parsed.map(normalizeHabit))
        } else {
          setHabits([])
        }
      } else {
        setHabits([])
      }
    } catch {
      setHabits([])
    }
    setCurrentUser(user)
    setIsProfileOpen(false)
    setAuthName('')
    setAuthEmail('')
    setAuthPassword('')
    setAuthStatus({ type: '', message: '' })
  }

  const loginUser = async (event) => {
    event.preventDefault()
    const payload = {
      email: authEmail.trim(),
      password: authPassword,
    }

    if (!payload.email || !payload.password) {
      setAuthStatus({ type: 'error', message: text.requiredFields })
      return
    }

    setIsAuthLoading(true)
    setAuthStatus({ type: '', message: '' })

    const API_BASE = import.meta.env.VITE_API_URL ?? ''
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        const messageByCode = {
          INVALID_CREDENTIALS: text.invalidCredentials,
          MISSING_FIELDS: text.requiredFields,
        }
        setAuthStatus({ type: 'error', message: messageByCode[data.code] ?? text.invalidCredentials })
        return
      }

      openUserSession(data.user)
    } catch {
      setAuthStatus({ type: 'error', message: text.invalidCredentials })
    } finally {
      setIsAuthLoading(false)
    }
  }

  const registerUser = async (event) => {
    event.preventDefault()
    const payload = {
      name: authName.trim(),
      email: authEmail.trim(),
      password: authPassword,
    }

    if (!payload.name || !payload.email || !payload.password) {
      setAuthStatus({ type: 'error', message: text.requiredFields })
      return
    }

    setIsAuthLoading(true)
    setAuthStatus({ type: '', message: '' })

    const API_BASE = import.meta.env.VITE_API_URL ?? ''
    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        const messageByCode = {
          EMAIL_EXISTS: text.emailExists,
          INVALID_EMAIL: text.invalidEmail,
          WEAK_PASSWORD: text.weakPassword,
          MISSING_FIELDS: text.requiredFields,
        }
        setAuthStatus({ type: 'error', message: messageByCode[data.code] ?? text.genericSignUpError })
        return
      }

      openUserSession(data.user)
    } catch {
      setAuthStatus({ type: 'error', message: text.genericSignUpError })
    } finally {
      setIsAuthLoading(false)
    }
  }

  const logoutUser = () => {
    localStorage.removeItem(SESSION_KEY)
    setCurrentUser(null)
    setHabits([])
    setIsProfileOpen(false)
  }

  const toggleProfilePanel = () => {
    setIsProfileOpen((prev) => {
      const next = !prev
      if (next) {
        setIsAddOpen(false)
        setIsSettingsOpen(false)
        setAuthStatus({ type: '', message: '' })
      }
      return next
    })
  }

  return (
    <main className="app-shell container-fluid px-0">
      <HeroPanel language={language} stats={stats} text={text} />

      <section className="control-panel">
        <div className="control-topbar">
          <div className="control-actions">
            {currentUser && (
              <div className="panel-anchor">
                <button
                  type="button"
                  className={isAddOpen ? 'settings-btn active add-toggle-btn' : 'settings-btn add-toggle-btn'}
                  onClick={toggleAddPanel}
                  aria-expanded={isAddOpen}
                  aria-controls="add-habit-panel"
                >
                  <span aria-hidden="true">✦</span>
                  {text.add}
                </button>
                {isAddOpen && (
                  <div id="add-habit-panel" className="add-card add-panel">
                    <h2>{text.addNewHabit}</h2>
                    <div className="add-row">
                      <input
                        value={habitName}
                        onChange={(event) => setHabitName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            addHabit()
                          }
                        }}
                        placeholder={text.placeholderHabit}
                        aria-label={text.habitName}
                      />
                      <button onClick={addHabit} type="button">
                        {text.add}
                      </button>
                    </div>
                    <div className="recurrence-row">
                      <label htmlFor="recurrence-picker">{text.repeat}</label>
                      <select
                        id="recurrence-picker"
                        value={habitRecurrence}
                        onChange={(event) => {
                          const nextRecurrence = event.target.value
                          setHabitRecurrence(nextRecurrence)
                          if (nextRecurrence === 'weekly') {
                            setHabitWeeklyDays([new Date(todayKey).getDay()])
                          }
                        }}
                      >
                        {recurrenceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {habitRecurrence === 'weekly' && (
                      <div className="weekly-day-row">
                        <span>{text.daysOfWeek}</span>
                        <div className="weekly-days-list" role="group" aria-label={text.selectWeeklyDays}>
                          {WEEKDAY_OPTIONS.map((day) => (
                            <label key={day.value} className="weekday-item">
                              <input
                                type="checkbox"
                                checked={habitWeeklyDays.includes(day.value)}
                                onChange={() => toggleWeeklySelection(day.value)}
                              />
                              <span>{WEEKDAY_LABELS[language]?.[day.value] ?? WEEKDAY_LABELS.en[day.value]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="color-row" role="radiogroup" aria-label={text.chooseColor}>
                      {ACCENT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={habitColor === color ? 'color-dot active' : 'color-dot'}
                          style={{ backgroundColor: color }}
                          onClick={() => setHabitColor(color)}
                          aria-label={`${text.color} ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <SettingsPanel
              activeSettingsTab={activeSettingsTab}
              isSettingsOpen={isSettingsOpen}
              language={language}
              setActiveSettingsTab={setActiveSettingsTab}
              setLanguage={setLanguage}
              setTheme={setTheme}
              text={text}
              theme={theme}
              toggleSettingsPanel={toggleSettingsPanel}
            />

            <ProfilePanel
              authEmail={authEmail}
              authName={authName}
              authPassword={authPassword}
              authStatus={authStatus}
              currentUser={currentUser}
              isAuthLoading={isAuthLoading}
              isProfileOpen={isProfileOpen}
              loginUser={loginUser}
              logoutUser={logoutUser}
              profileTab={profileTab}
              registerUser={registerUser}
              setAuthEmail={setAuthEmail}
              setAuthName={setAuthName}
              setAuthPassword={setAuthPassword}
              setAuthStatus={setAuthStatus}
              setProfileTab={setProfileTab}
              text={text}
              toggleProfilePanel={toggleProfilePanel}
            />
          </div>
        </div>

        <div className="habit-list">
          {!currentUser ? (
            <EmptyState message={text.noUserHabits} />
          ) : habits.length === 0 ? (
            <EmptyState message={text.emptyNote} />
          ) : (
            <>
              <div className="habit-group">
                <h2>{text.todayHabits}</h2>
                {todayHabits.length === 0 ? (
                  <EmptyState message={text.noHabitsToday} />
                ) : (
                  todayHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      cancelDeleteHabit={cancelDeleteHabit}
                      cancelEditing={cancelEditing}
                      confirmDeleteId={confirmDeleteId}
                      editingHabitId={editingHabitId}
                      editingName={editingName}
                      editingWeeklyDays={editingWeeklyDays}
                      habit={habit}
                      language={language}
                      removeHabit={removeHabit}
                      requestDeleteHabit={requestDeleteHabit}
                      saveEditing={saveEditing}
                      setEditingName={setEditingName}
                      startEditing={startEditing}
                      text={text}
                      todayKey={todayKey}
                      toggleEditingWeeklySelection={toggleEditingWeeklySelection}
                      toggleHabit={toggleHabit}
                    />
                  ))
                )}
              </div>

              <div className="habit-group">
                <h2>{text.otherHabits}</h2>
                {otherHabits.length === 0 ? (
                  <EmptyState message={text.noOtherHabits} />
                ) : (
                  otherHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      cancelDeleteHabit={cancelDeleteHabit}
                      cancelEditing={cancelEditing}
                      confirmDeleteId={confirmDeleteId}
                      editingHabitId={editingHabitId}
                      editingName={editingName}
                      editingWeeklyDays={editingWeeklyDays}
                      habit={habit}
                      language={language}
                      removeHabit={removeHabit}
                      requestDeleteHabit={requestDeleteHabit}
                      saveEditing={saveEditing}
                      setEditingName={setEditingName}
                      startEditing={startEditing}
                      text={text}
                      todayKey={todayKey}
                      toggleEditingWeeklySelection={toggleEditingWeeklySelection}
                      toggleHabit={toggleHabit}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}