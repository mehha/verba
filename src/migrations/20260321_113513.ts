import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`hidden_shared_board_ids\` text DEFAULT '[]';`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`hidden_shared_puzzle_ids\` text DEFAULT '[]';`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`shared_board_order\` text DEFAULT '[]';`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`shared_puzzle_order\` text DEFAULT '[]';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`hidden_shared_board_ids\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`hidden_shared_puzzle_ids\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`shared_board_order\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`shared_puzzle_order\`;`)
}
