export async function initializeAuthorization(): Promise<void> {
  if (import.meta.env.DEV) return
  const fragment = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const params = new URLSearchParams(fragment)
  const apiKey = params.get('key')

  if (apiKey) {
    // The fragment is never sent in the initial HTTP request. Remove it immediately
    // so it does not remain in the address bar or browser history.
    window.history.replaceState(
      window.history.state,
      document.title,
      window.location.pathname + window.location.search,
    )

    const bootstrapResponse = await fetch('/auth/bootstrap', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    })

    if (!bootstrapResponse.ok) {
      if (bootstrapResponse.status === 401) {
        throw new Error('启动授权码不正确，请检查桌面 BAT 中的 API Key。')
      }
      throw new Error('授权初始化失败（HTTP ' + bootstrapResponse.status + '）。')
    }
  }

  const statusResponse = await fetch('/auth/status', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  })

  if (!statusResponse.ok) {
    throw new Error('当前隐私窗口尚未授权。请关闭后重新双击桌面上的 Chatlog 启动 BAT。')
  }
}