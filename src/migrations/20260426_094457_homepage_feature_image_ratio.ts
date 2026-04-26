import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage_features_items\` ADD \`image_aspect_ratio\` text DEFAULT '16/9';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage_features_items\` ADD \`image_aspect_ratio\` text DEFAULT '16/9';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_suhtleja_homepage_features_items\` DROP COLUMN \`image_aspect_ratio\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_suhtleja_homepage_features_items\` DROP COLUMN \`image_aspect_ratio\`;`)
}
