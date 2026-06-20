(async () => {
  const url = 'http://192.168.43.119:3000/api/auth/login'
  const body = { email: 'add@gmail.com', password: '123456789' }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch (e) { console.error('Response not JSON:\n', text); process.exit(1) }

    const token = json.token || json.access_token || (json.data && json.data.token)
    const user = json.user || (json.data && json.data.user) || json

    console.log('HTTP', res.status)
    console.log('token:', token)
    console.log('user:', JSON.stringify(user, null, 2))
  } catch (err) {
    console.error('Request failed:', err)
    process.exit(1)
  }
})()
