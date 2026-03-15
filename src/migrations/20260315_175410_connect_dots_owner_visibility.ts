import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`connect_dots_puzzles\` ADD \`visible_to_all_users\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`connect_dots_puzzles\` ADD \`owner_id\` integer REFERENCES users(id);`)
  // Legacy puzzles were previously visible to everyone; keep that behavior after the migration.
  await db.run(sql`UPDATE \`connect_dots_puzzles\` SET \`visible_to_all_users\` = true;`)
  // Assign a fallback owner for legacy rows so admins can still manage them after the schema change.
  await db.run(
    sql`UPDATE \`connect_dots_puzzles\`
        SET \`owner_id\` = COALESCE(
          (SELECT \`id\` FROM \`users\` WHERE \`role\` = 'admin' ORDER BY \`id\` LIMIT 1),
          (SELECT \`id\` FROM \`users\` ORDER BY \`id\` LIMIT 1)
        )
        WHERE \`owner_id\` IS NULL;`,
  )
  await db.run(sql`CREATE INDEX \`connect_dots_puzzles_owner_idx\` ON \`connect_dots_puzzles\` (\`owner_id\`);`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_connect_dots_puzzles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`description\` text,
  	\`background_music_id\` integer,
  	\`external_image_u_r_l\` text,
  	\`dots\` text NOT NULL,
  	\`image_id\` integer,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`background_music_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_connect_dots_puzzles\`("id", "title", "enabled", "order", "description", "background_music_id", "external_image_u_r_l", "dots", "image_id", "generate_slug", "slug", "updated_at", "created_at") SELECT "id", "title", "enabled", "order", "description", "background_music_id", "external_image_u_r_l", "dots", "image_id", "generate_slug", "slug", "updated_at", "created_at" FROM \`connect_dots_puzzles\`;`)
  await db.run(sql`DROP TABLE \`connect_dots_puzzles\`;`)
  await db.run(sql`ALTER TABLE \`__new_connect_dots_puzzles\` RENAME TO \`connect_dots_puzzles\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`connect_dots_puzzles_background_music_idx\` ON \`connect_dots_puzzles\` (\`background_music_id\`);`)
  await db.run(sql`CREATE INDEX \`connect_dots_puzzles_image_idx\` ON \`connect_dots_puzzles\` (\`image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`connect_dots_puzzles_slug_idx\` ON \`connect_dots_puzzles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`connect_dots_puzzles_updated_at_idx\` ON \`connect_dots_puzzles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`connect_dots_puzzles_created_at_idx\` ON \`connect_dots_puzzles\` (\`created_at\`);`)
}
