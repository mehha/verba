import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '@/access/IsAdmin'
import bcrypt from 'bcryptjs'

const DEFAULT_PARENT_PIN = process.env.DEFAULT_PARENT_PIN || '0000'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: isAdmin,
    create: () => true,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 // 1 day
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && !data.parentPinHash) {
          data.parentPinHash = await bcrypt.hash(DEFAULT_PARENT_PIN, 10)
          data.pinUpdatedAt = new Date().toISOString()
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      options: ['admin', 'user'],
      required: true,
    },
    {
      name: 'parentPinHash',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Hashed PIN vanema vaate jaoks',
      },
    },
    {
      name: 'pinUpdatedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
