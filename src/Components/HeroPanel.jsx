import { formatLongDate, formatShortDate } from '../utils/date'

export default function HeroPanel({ language, stats, text }) {
  return (
    <section className="hero-panel">
      <h1>HABITOPEDIA</h1>
      <p className="eyebrow">{text.appEyebrow}</p>

      <div className="stats-grid">
        <article>
          <span>{text.completedToday}</span>
          <strong>
            {stats.completedToday}/{stats.total}
          </strong>
        </article>
        <article>
          <span>{text.dailyScore}</span>
          <strong>{stats.completionRate}%</strong>
        </article>
        <article>
          <span>{text.activeHabits}</span>
          <strong>{stats.total}</strong>
        </article>
      </div>

      <div className="week-strip" aria-label={text.weeklyProgress}>
        {stats.weekRatio.map((day) => (
          <div key={day.key} className="day-pill" title={`${formatLongDate(day.key, language)}: ${day.percent}%`}>
            <span>{formatShortDate(day.key, language)}</span>
            <div className="meter">
              <i style={{ width: `${day.percent}%` }}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="monthly-card">
        <div className="monthly-head">
          <h2>{text.last30Days}</h2>
          <span>{stats.monthAverage}% {text.average}</span>
        </div>
        <div className="month-bars" aria-label={text.monthlyProgressChart}>
          {stats.monthRatio.map((day) => (
            <i
              key={day.key}
              title={`${formatLongDate(day.key, language)}: ${day.percent}%`}
              style={{ height: `${Math.max(day.percent, 4)}%` }}
            ></i>
          ))}
        </div>
        <p className="trend-note">
          {text.weeklyTrend}{' '}
          <strong className={stats.trend >= 0 ? 'trend-up' : 'trend-down'}>
            {stats.trend >= 0 ? '+' : ''}
            {stats.trend}%
          </strong>
        </p>
      </div>
    </section>
  )
}