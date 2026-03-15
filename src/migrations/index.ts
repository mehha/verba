import * as migration_20260314_183139 from './20260314_183139';
import * as migration_20260315_175410_connect_dots_owner_visibility from './20260315_175410_connect_dots_owner_visibility';

export const migrations = [
  {
    up: migration_20260314_183139.up,
    down: migration_20260314_183139.down,
    name: '20260314_183139',
  },
  {
    up: migration_20260315_175410_connect_dots_owner_visibility.up,
    down: migration_20260315_175410_connect_dots_owner_visibility.down,
    name: '20260315_175410_connect_dots_owner_visibility'
  },
];
