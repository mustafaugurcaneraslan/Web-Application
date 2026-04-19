import { WEEKDAY_OPTIONS } from '../constants/habits'
import { WEEKDAY_LABELS } from '../constants/i18n'
import { getBestStreak, getStreak, hexToRgba, isHabitScheduledForDate, recurrenceLabel } from '../utils/habits'

export default function HabitCard({
  cancelDeleteHabit,
  cancelEditing,
  confirmDeleteId,
  editingHabitId,
  editingName,
  editingWeeklyDays,
  habit,
  language,
  removeHabit,
  requestDeleteHabit,
  saveEditing,
  setEditingName,
  text,
  todayKey,
  toggleEditingWeeklySelection,
  toggleHabit,
  startEditing,
}) {
  const isDone = Boolean(habit.history?.[todayKey])
  const isScheduled = isHabitScheduledForDate(habit, todayKey)
  const currentStreak = getStreak(habit.history ?? {}, todayKey)
  const bestStreak = getBestStreak(habit.history ?? {})
  const isEditing = editingHabitId === habit.id
  const habitCardStyle = {
    '--habit-accent-soft': hexToRgba(habit.color, 0.18),
    '--habit-accent-strong': hexToRgba(habit.color, 0.34),
    '--habit-accent-border': hexToRgba(habit.color, 0.42),
    '--habit-accent-wash': hexToRgba(habit.color, 0.14),
  }

  return (
    <article
      key={habit.id}
      className={isDone ? 'habit-item done' : 'habit-item'}
      data-scheduled={isScheduled ? 'yes' : 'no'}
      style={habitCardStyle}
    >
      <button
        type="button"
        className={isDone ? 'check-btn checked' : 'check-btn'}
        onClick={() => toggleHabit(habit.id)}
        aria-label={`${text.toggle} ${habit.name}`}
        disabled={!isScheduled}
        title={isScheduled ? text.markComplete : text.notScheduled}
      >
        {isDone ? '✓' : ''}
      </button>

      <div className="habit-main">
        {isEditing ? (
          <div className="edit-row">
            <input
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  saveEditing()
                }
                if (event.key === 'Escape') {
                  cancelEditing()
                }
              }}
              aria-label={`${text.edit} ${habit.name}`}
            />
            <button type="button" className="mini" onClick={saveEditing}>
              {text.save}
            </button>
            <button type="button" className="mini ghost-mini" onClick={cancelEditing}>
              {text.cancel}
            </button>
            {habit.recurrence === 'weekly' && (
              <div className="edit-weekly-days">
                <span>{text.weeklyDays}</span>
                <div className="weekly-days-list" role="group" aria-label={`${text.editDaysFor} ${habit.name}`}>
                  {WEEKDAY_OPTIONS.map((day) => (
                    <label key={day.value} className="weekday-item">
                      <input
                        type="checkbox"
                        checked={editingWeeklyDays.includes(day.value)}
                        onChange={() => toggleEditingWeeklySelection(day.value)}
                      />
                      <span>{WEEKDAY_LABELS[language]?.[day.value] ?? WEEKDAY_LABELS.en[day.value]}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <h3>{habit.name}</h3>
        )}
        <p>
          {text.streak}: <strong>{currentStreak}</strong> {text.days} | {text.best}: <strong>{bestStreak}</strong>
        </p>
        <p className="habit-meta">{recurrenceLabel(habit, language)}</p>
      </div>

      <div className="item-actions">
        {confirmDeleteId === habit.id ? (
          <div className="delete-confirm" role="alert" aria-live="polite">
            <span>{text.areYouSure}</span>
            <button
              type="button"
              className="mini confirm-btn"
              onClick={() => removeHabit(habit.id)}
              aria-label={`${text.confirmDelete} ${habit.name}`}
            >
              {text.yes}
            </button>
            <button
              type="button"
              className="mini ghost-mini"
              onClick={cancelDeleteHabit}
              aria-label={`${text.cancelDelete} ${habit.name}`}
            >
              {text.cancel}
            </button>
          </div>
        ) : (
          <>
            {!isEditing && (
              <button
                type="button"
                className="mini ghost-mini"
                onClick={() => startEditing(habit)}
                aria-label={`${text.edit} ${habit.name}`}
              >
                {text.edit}
              </button>
            )}
            <button
              type="button"
              className="remove-btn"
              onClick={() => requestDeleteHabit(habit.id)}
              aria-label={`${text.delete} ${habit.name}`}
            >
              {text.delete}
            </button>
          </>
        )}
      </div>
    </article>
  )
}