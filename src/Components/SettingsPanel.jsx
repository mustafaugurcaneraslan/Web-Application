import { LANGUAGE_OPTIONS } from '../constants/i18n'
import { THEME_COPY, THEME_OPTIONS } from '../constants/themes'

export default function SettingsPanel({
  activeSettingsTab,
  isSettingsOpen,
  language,
  setActiveSettingsTab,
  setLanguage,
  setTheme,
  text,
  theme,
  toggleSettingsPanel,
}) {
  return (
    <div className="panel-anchor">
      <button
        type="button"
        className={isSettingsOpen ? 'settings-btn active' : 'settings-btn'}
        onClick={toggleSettingsPanel}
        aria-expanded={isSettingsOpen}
        aria-controls="theme-settings"
      >
        <span aria-hidden="true">⚙</span>
        {text.settings}
      </button>
      {isSettingsOpen && (
        <div id="theme-settings" className="settings-panel">
          <div className="settings-head">
            <h2>{text.settings}</h2>
            <p>{activeSettingsTab === 'theme' ? text.themeSettingsDesc : text.languageSettingsDesc}</p>
          </div>
          <div className="settings-tabs" role="tablist" aria-label={text.settings}>
            <button
              type="button"
              role="tab"
              className={activeSettingsTab === 'theme' ? 'settings-tab active' : 'settings-tab'}
              aria-selected={activeSettingsTab === 'theme'}
              onClick={() => setActiveSettingsTab('theme')}
            >
              <span className="settings-tab-icon" aria-hidden="true">◈</span>
              {text.themeTab}
            </button>
            <button
              type="button"
              role="tab"
              className={activeSettingsTab === 'language' ? 'settings-tab active' : 'settings-tab'}
              aria-selected={activeSettingsTab === 'language'}
              onClick={() => setActiveSettingsTab('language')}
            >
              <span className="settings-tab-icon" aria-hidden="true">◎</span>
              {text.languageTab}
            </button>
          </div>
          {activeSettingsTab === 'theme' ? (
            <div className="theme-grid" role="radiogroup" aria-label={text.chooseTheme}>
              {THEME_OPTIONS.map((option) => {
                const localizedTheme = THEME_COPY[language]?.[option.value] ?? option
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={theme === option.value ? 'theme-card active' : 'theme-card'}
                    onClick={() => setTheme(option.value)}
                    aria-pressed={theme === option.value}
                  >
                    <span className={`theme-preview ${option.value}`}></span>
                    <strong>{localizedTheme.name}</strong>
                    <small>{localizedTheme.description}</small>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="language-grid" role="radiogroup" aria-label={text.language}>
              {LANGUAGE_OPTIONS.map((option) => {
                const isActive = language === option.value
                const isEnglish = option.value === 'en'
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={isActive ? 'language-card active' : 'language-card'}
                    onClick={() => setLanguage(option.value)}
                    aria-pressed={isActive}
                  >
                    <strong>{isEnglish ? 'English' : 'Türkçe'}</strong>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}