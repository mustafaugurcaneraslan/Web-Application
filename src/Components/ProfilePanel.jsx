export default function ProfilePanel({
  authEmail,
  authName,
  authPassword,
  authStatus,
  currentUser,
  isAuthLoading,
  isProfileOpen,
  loginUser,
  logoutUser,
  profileTab,
  registerUser,
  setAuthEmail,
  setAuthName,
  setAuthPassword,
  setAuthStatus,
  setProfileTab,
  text,
  toggleProfilePanel,
}) {
  return (
    <div className="panel-anchor">
      <button
        type="button"
        className={isProfileOpen ? 'settings-btn active profile-toggle-btn' : 'settings-btn profile-toggle-btn'}
        onClick={toggleProfilePanel}
        aria-expanded={isProfileOpen}
        aria-controls="profile-panel"
      >
        {currentUser ? (
          <span className="profile-initial" aria-hidden="true">{currentUser.name[0].toUpperCase()}</span>
        ) : (
          <span aria-hidden="true">◉</span>
        )}
        {currentUser ? currentUser.name.split(' ')[0] : text.profileBtn}
      </button>
      {isProfileOpen && (
        <div id="profile-panel" className="settings-panel profile-panel">
          {currentUser ? (
            <>
              <div className="profile-user-info">
                <span className="profile-avatar">{currentUser.name[0].toUpperCase()}</span>
                <div>
                  <strong>{currentUser.name}</strong>
                  <p>{currentUser.email}</p>
                </div>
              </div>
              <button type="button" className="logout-btn" onClick={logoutUser}>
                {text.logOut}
              </button>
            </>
          ) : (
            <>
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  className={profileTab === 'login' ? 'auth-tab active' : 'auth-tab'}
                  aria-selected={profileTab === 'login'}
                  onClick={() => {
                    setProfileTab('login')
                    setAuthStatus({ type: '', message: '' })
                  }}
                >
                  {text.loginTab}
                </button>
                <button
                  type="button"
                  role="tab"
                  className={profileTab === 'register' ? 'auth-tab active' : 'auth-tab'}
                  aria-selected={profileTab === 'register'}
                  onClick={() => {
                    setProfileTab('register')
                    setAuthStatus({ type: '', message: '' })
                  }}
                >
                  {text.registerTab}
                </button>
              </div>
              {profileTab === 'login' ? (
                <form className="auth-fields" onSubmit={loginUser}>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    placeholder={text.email}
                    aria-label={text.email}
                    autoComplete="email"
                  />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder={text.password}
                    aria-label={text.password}
                    autoComplete="current-password"
                  />
                  <button type="submit" disabled={isAuthLoading}>
                    {isAuthLoading ? text.loggingIn : text.logIn}
                  </button>
                  {authStatus.message ? (
                    <p className={authStatus.type === 'error' ? 'auth-status error' : 'auth-status success'}>
                      {authStatus.message}
                    </p>
                  ) : null}
                </form>
              ) : (
                <form className="auth-fields" onSubmit={registerUser}>
                  <input
                    type="text"
                    value={authName}
                    onChange={(event) => setAuthName(event.target.value)}
                    placeholder={text.fullName}
                    aria-label={text.fullName}
                    autoComplete="name"
                  />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    placeholder={text.email}
                    aria-label={text.email}
                    autoComplete="email"
                  />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder={text.password}
                    aria-label={text.password}
                    autoComplete="new-password"
                  />
                  <button type="submit" disabled={isAuthLoading}>
                    {isAuthLoading ? text.signingUp : text.signUp}
                  </button>
                  {authStatus.message ? (
                    <p className={authStatus.type === 'error' ? 'auth-status error' : 'auth-status success'}>
                      {authStatus.message}
                    </p>
                  ) : null}
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}