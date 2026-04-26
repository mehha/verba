import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage\` ADD \`hero_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage\` ADD \`video_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage\` ADD \`features_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage\` ADD \`audience_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage\` ADD \`hero_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage\` ADD \`video_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage\` ADD \`features_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage\` ADD \`audience_enabled\` integer DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage\` DROP COLUMN \`hero_enabled\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage\` DROP COLUMN \`video_enabled\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage\` DROP COLUMN \`features_enabled\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage\` DROP COLUMN \`audience_enabled\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage\` DROP COLUMN \`hero_enabled\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage\` DROP COLUMN \`video_enabled\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage\` DROP COLUMN \`features_enabled\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage\` DROP COLUMN \`audience_enabled\`;`)
}
