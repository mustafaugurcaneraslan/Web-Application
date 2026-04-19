import express from 'express'
import cors from 'cors'
import { promises as fs } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const usersFile = path.join(dataDir, 'users.json')

const app = express()
app.use(cors())
app.use(express.json())

async function ensureUsersFile() {
  await fs.mkdir(dataDir, { recursive: true })
  try {
    await fs.access(usersFile)
  } catch {
    await fs.writeFile(usersFile, '[]\n', 'utf8')
  }
}

async function readUsers() {
  await ensureUsersFile()
  const raw = await fs.readFile(usersFile, 'utf8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
}

async function writeUsers(users) {
  await fs.writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, 'utf8')
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex')
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/register', async (req, res) => {
  const name = String(req.body?.name ?? '').trim()
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')

  if (!name || !email || !password) {
    return res.status(400).json({ code: 'MISSING_FIELDS' })
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!isEmailValid) {
    return res.status(400).json({ code: 'INVALID_EMAIL' })
  }

  if (password.length < 4) {
    return res.status(400).json({ code: 'WEAK_PASSWORD' })
  }

  try {
    const users = await readUsers()
    if (users.some((user) => user.email === email)) {
      return res.status(409).json({ code: 'EMAIL_EXISTS' })
    }

    const user = {
      id: randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    }

    users.push(user)
    await writeUsers(users)

    return res.status(201).json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch {
    return res.status(500).json({ code: 'SERVER_ERROR' })
  }
})

app.post('/api/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')

  if (!email || !password) {
    return res.status(400).json({ code: 'MISSING_FIELDS' })
  }

  try {
    const users = await readUsers()
    const user = users.find((u) => u.email === email)
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ code: 'INVALID_CREDENTIALS' })
    }

    return res.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch {
    return res.status(500).json({ code: 'SERVER_ERROR' })
  }
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  console.log(`Backend ready on http://localhost:${PORT}`)
})
