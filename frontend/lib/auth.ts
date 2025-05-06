import * as jwt from 'jsonwebtoken'

export const COOKIE_NAME = 'auth_token'

export const parseExpiration = (expr: string): number => {
  const n = parseInt(expr, 10)
  if (isNaN(n)) return 86_400
  if (expr.endsWith('d')) return n * 86_400
  if (expr.endsWith('h')) return n * 3_600
  if (expr.endsWith('m')) return n * 60
  return n
}

export const signToken = (secret: jwt.Secret, expiresIn: number): string => {
  return jwt.sign({}, secret, { expiresIn })
}
