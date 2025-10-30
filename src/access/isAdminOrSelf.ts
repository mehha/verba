import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const isAdminOrSelf = ({ req, id }: AccessArgs<User>) => {
  if (!req.user) return false
  if (req.user.role === 'admin') return true
  // id is the user doc id being accessed
  return req.user.id === id
}
