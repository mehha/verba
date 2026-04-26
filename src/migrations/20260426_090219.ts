import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_suhtleja_homepage_hero_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_suhtleja_homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_hero_highlights_order_idx\` ON \`pages_blocks_suhtleja_homepage_hero_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_hero_highlights_parent_id_idx\` ON \`pages_blocks_suhtleja_homepage_hero_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_suhtleja_homepage_features_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`image_id\` integer,
  	\`image_label\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_suhtleja_homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_features_items_order_idx\` ON \`pages_blocks_suhtleja_homepage_features_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_features_items_parent_id_idx\` ON \`pages_blocks_suhtleja_homepage_features_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_features_items_image_idx\` ON \`pages_blocks_suhtleja_homepage_features_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_suhtleja_homepage_audience_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_suhtleja_homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_audience_items_order_idx\` ON \`pages_blocks_suhtleja_homepage_audience_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_audience_items_parent_id_idx\` ON \`pages_blocks_suhtleja_homepage_audience_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_suhtleja_homepage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hero_eyebrow\` text DEFAULT 'Eestikeelne suhtluse ja harjutamise keskkond',
  	\`hero_title\` text DEFAULT 'Suhtleja aitab lapsel piltide, heli ja mängu kaudu suhelda',
  	\`hero_description\` text DEFAULT 'Eestikeelne keskkond suhtlustahvlite ja lihtsate õppemängude loomiseks. Laps saab turvalises vaates valida pilte, kuulata sõnu ja harjutada oskusi omas tempos.',
  	\`hero_image_id\` integer,
  	\`hero_primary_cta_label\` text DEFAULT 'Alusta kasutamist',
  	\`hero_primary_cta_href\` text DEFAULT '/register',
  	\`hero_secondary_cta_label\` text DEFAULT 'Vaata võimalusi',
  	\`hero_secondary_cta_href\` text DEFAULT '#voimalused',
  	\`video_eyebrow\` text DEFAULT 'Video',
  	\`video_title\` text DEFAULT 'Vaata, kuidas üks tahvel muutub lapse igapäevaseks abiliseks',
  	\`video_description\` text DEFAULT 'Lühikeses videos näed, kuidas luua piltidega tahvel, lisada sinna sõnad ja kasutada seda lapsevaates. Sama keskkonna kaudu saab avada ka mängulisi harjutusi.',
  	\`video_poster_id\` integer,
  	\`video_video_file_id\` integer,
  	\`video_embed_url\` text,
  	\`video_placeholder_label\` text DEFAULT 'Video lisandub peagi',
  	\`features_eyebrow\` text DEFAULT 'Võimalused',
  	\`features_title\` text DEFAULT 'Suhtlustahvlid ja harjutused samas kohas',
  	\`features_description\` text DEFAULT 'Suhtleja ei ole ainult pildipank. See on lapsele lihtne koduvaade, kus vajalikud suhtlustahvlid ja mängulised tegevused on kohe kättesaadavad.',
  	\`audience_title\` text DEFAULT 'Loodud igapäevaseks kasutamiseks kodus, lasteaias, koolis ja teraapias',
  	\`audience_description\` text DEFAULT 'Suhtleja sobib lapsele, kes vajab suhtlemisel visuaalset tuge, lihtsat valikute tegemist või korduvat harjutamist. Keskkond aitab täiskasvanul valmistada ette selgeid tegevusi ja hoida lapse ekraani rahulikuna.',
  	\`audience_image_id\` integer,
  	\`audience_cta_label\` text DEFAULT 'Loo lapsele esimene koduvaade',
  	\`audience_cta_href\` text DEFAULT '/register',
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`audience_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_order_idx\` ON \`pages_blocks_suhtleja_homepage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_parent_id_idx\` ON \`pages_blocks_suhtleja_homepage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_path_idx\` ON \`pages_blocks_suhtleja_homepage\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_hero_hero_image_idx\` ON \`pages_blocks_suhtleja_homepage\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_video_video_poster_idx\` ON \`pages_blocks_suhtleja_homepage\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_video_video_video_file_idx\` ON \`pages_blocks_suhtleja_homepage\` (\`video_video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_suhtleja_homepage_audience_audience_image_idx\` ON \`pages_blocks_suhtleja_homepage\` (\`audience_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_suhtleja_homepage_hero_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_suhtleja_homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_hero_highlights_order_idx\` ON \`_pages_v_blocks_suhtleja_homepage_hero_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_hero_highlights_parent_id_idx\` ON \`_pages_v_blocks_suhtleja_homepage_hero_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_suhtleja_homepage_features_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`image_id\` integer,
  	\`image_label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_suhtleja_homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_features_items_order_idx\` ON \`_pages_v_blocks_suhtleja_homepage_features_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_features_items_parent_id_idx\` ON \`_pages_v_blocks_suhtleja_homepage_features_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_features_items_image_idx\` ON \`_pages_v_blocks_suhtleja_homepage_features_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_suhtleja_homepage_audience_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_suhtleja_homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_audience_items_order_idx\` ON \`_pages_v_blocks_suhtleja_homepage_audience_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_audience_items_parent_id_idx\` ON \`_pages_v_blocks_suhtleja_homepage_audience_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_suhtleja_homepage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_eyebrow\` text DEFAULT 'Eestikeelne suhtluse ja harjutamise keskkond',
  	\`hero_title\` text DEFAULT 'Suhtleja aitab lapsel piltide, heli ja mängu kaudu suhelda',
  	\`hero_description\` text DEFAULT 'Eestikeelne keskkond suhtlustahvlite ja lihtsate õppemängude loomiseks. Laps saab turvalises vaates valida pilte, kuulata sõnu ja harjutada oskusi omas tempos.',
  	\`hero_image_id\` integer,
  	\`hero_primary_cta_label\` text DEFAULT 'Alusta kasutamist',
  	\`hero_primary_cta_href\` text DEFAULT '/register',
  	\`hero_secondary_cta_label\` text DEFAULT 'Vaata võimalusi',
  	\`hero_secondary_cta_href\` text DEFAULT '#voimalused',
  	\`video_eyebrow\` text DEFAULT 'Video',
  	\`video_title\` text DEFAULT 'Vaata, kuidas üks tahvel muutub lapse igapäevaseks abiliseks',
  	\`video_description\` text DEFAULT 'Lühikeses videos näed, kuidas luua piltidega tahvel, lisada sinna sõnad ja kasutada seda lapsevaates. Sama keskkonna kaudu saab avada ka mängulisi harjutusi.',
  	\`video_poster_id\` integer,
  	\`video_video_file_id\` integer,
  	\`video_embed_url\` text,
  	\`video_placeholder_label\` text DEFAULT 'Video lisandub peagi',
  	\`features_eyebrow\` text DEFAULT 'Võimalused',
  	\`features_title\` text DEFAULT 'Suhtlustahvlid ja harjutused samas kohas',
  	\`features_description\` text DEFAULT 'Suhtleja ei ole ainult pildipank. See on lapsele lihtne koduvaade, kus vajalikud suhtlustahvlid ja mängulised tegevused on kohe kättesaadavad.',
  	\`audience_title\` text DEFAULT 'Loodud igapäevaseks kasutamiseks kodus, lasteaias, koolis ja teraapias',
  	\`audience_description\` text DEFAULT 'Suhtleja sobib lapsele, kes vajab suhtlemisel visuaalset tuge, lihtsat valikute tegemist või korduvat harjutamist. Keskkond aitab täiskasvanul valmistada ette selgeid tegevusi ja hoida lapse ekraani rahulikuna.',
  	\`audience_image_id\` integer,
  	\`audience_cta_label\` text DEFAULT 'Loo lapsele esimene koduvaade',
  	\`audience_cta_href\` text DEFAULT '/register',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_video_file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`audience_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_order_idx\` ON \`_pages_v_blocks_suhtleja_homepage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_parent_id_idx\` ON \`_pages_v_blocks_suhtleja_homepage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_path_idx\` ON \`_pages_v_blocks_suhtleja_homepage\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_hero_hero_image_idx\` ON \`_pages_v_blocks_suhtleja_homepage\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_video_video_poster_idx\` ON \`_pages_v_blocks_suhtleja_homepage\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_video_video_video_file_idx\` ON \`_pages_v_blocks_suhtleja_homepage\` (\`video_video_file_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_suhtleja_homepage_audience_audience_imag_idx\` ON \`_pages_v_blocks_suhtleja_homepage\` (\`audience_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_suhtleja_homepage_hero_highlights\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_suhtleja_homepage_features_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_suhtleja_homepage_audience_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_suhtleja_homepage\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_suhtleja_homepage_hero_highlights\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_suhtleja_homepage_features_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_suhtleja_homepage_audience_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_suhtleja_homepage\`;`)
}
