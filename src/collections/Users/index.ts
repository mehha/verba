import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
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
