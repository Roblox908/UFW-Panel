import { NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { COOKIE_NAME, parseExpiration, signToken } from '@/lib/auth'

const AUTH_PASSWORD  = process.env.AUTH_PASSWORD
const JWT_SECRET     = process.env.JWT_SECRET as jwt.Secret | undefined
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d'

export async function GET() {
  if (!JWT_SECRET) {
    return NextResponse.json(
      { authenticated: false, error: 'Server configuration error.' },
      { status: 500 },
    )
  }

  const cookieStore = await cookies()
  const token       = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    jwt.verify(token, JWT_SECRET)
    return NextResponse.json({ authenticated: true })
  } catch {
    cookieStore.set({
      name:   COOKIE_NAME,
      value:  '',
      path:   '/',
      expires: new Date(0),
    })
    return NextResponse.json(
      { authenticated: false, error: 'Session expired or invalid.' },
      { status: 401 },
    )
  }
}

export async function POST(request: Request) {
  if (!AUTH_PASSWORD || !JWT_SECRET) {
    return NextResponse.json(
      { authenticated: false, error: 'Server configuration error.' },
      { status: 500 },
    )
  }

  const { password } = await request.json() as { password?: string }
  if (!password) {
    return NextResponse.json(
      { authenticated: false, error: 'Password not provided.' },
      { status: 400 },
    )
  }
  if (password !== AUTH_PASSWORD) {
    return NextResponse.json(
      { authenticated: false, error: 'Incorrect password.' },
      { status: 401 },
    )
  }

  const maxAge = parseExpiration(JWT_EXPIRATION)
  const token  = signToken(JWT_SECRET, maxAge)

  const cookieStore = await cookies()
  cookieStore.set({
    name:     COOKIE_NAME,
    value:    token,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
    sameSite: 'lax',
    maxAge,
  })

  return NextResponse.json({ authenticated: true })
}
