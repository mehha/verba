import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`quick_chat_buttons\`;`)
  await db.run(sql`DROP TABLE \`quick_chat\`;`)
  await db.run(sql`DROP TABLE \`tools_items\`;`)
  await db.run(sql`DROP TABLE \`tools\`;`)
  await db.run(sql`ALTER TABLE \`connect_dots_puzzles\` ADD \`pinned\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`last_feeling\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`last_feeling_at\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`quick_chat_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`phrase\` text NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`color\` text DEFAULT 'emerald',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`quick_chat\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`quick_chat_buttons_order_idx\` ON \`quick_chat_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`quick_chat_buttons_parent_id_idx\` ON \`quick_chat_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`quick_chat\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`tools_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tools\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tools_items_order_idx\` ON \`tools_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tools_items_parent_id_idx\` ON \`tools_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tools\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`users\` ADD \`last_feeling\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`last_feeling_at\` text;`)
  await db.run(sql`ALTER TABLE \`connect_dots_puzzles\` DROP COLUMN \`pinned\`;`)
}
