CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`line` text,
	`country` text,
	`is_built_in` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_line_idx` ON `brands` (`name`,`line`);--> statement-breakpoint
CREATE TABLE `paints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand_id` integer,
	`code` text,
	`name` text NOT NULL,
	`color_hex` text,
	`type` text DEFAULT 'lacquer' NOT NULL,
	`finish` text DEFAULT 'none' NOT NULL,
	`volume_ml` real,
	`quantity` real DEFAULT 0 NOT NULL,
	`remaining_pct` integer DEFAULT 100 NOT NULL,
	`min_quantity` real DEFAULT 1 NOT NULL,
	`location` text,
	`barcode` text,
	`photo_uri` text,
	`notes` text,
	`is_favorite` integer DEFAULT false NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `paints_brand_idx` ON `paints` (`brand_id`);--> statement-breakpoint
CREATE INDEX `paints_name_idx` ON `paints` (`name`);--> statement-breakpoint
CREATE INDEX `paints_code_idx` ON `paints` (`code`);--> statement-breakpoint
CREATE TABLE `project_paints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`paint_id` integer NOT NULL,
	`part` text,
	`mix_ratio` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paint_id`) REFERENCES `paints`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_paints_uniq_idx` ON `project_paints` (`project_id`,`paint_id`,`part`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`maker` text,
	`scale` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`started_at` integer,
	`finished_at` integer,
	`cover_uri` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shopping_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_type` text DEFAULT 'paint' NOT NULL,
	`ref_id` integer,
	`name` text NOT NULL,
	`brand` text,
	`code` text,
	`quantity` real DEFAULT 1 NOT NULL,
	`memo` text,
	`is_purchased` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stock_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_type` text NOT NULL,
	`item_id` integer NOT NULL,
	`delta` real NOT NULL,
	`reason` text DEFAULT 'adjust' NOT NULL,
	`project_id` integer,
	`note` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `stock_logs_item_idx` ON `stock_logs` (`item_type`,`item_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `supplies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'etc' NOT NULL,
	`brand` text,
	`spec` text,
	`quantity` real DEFAULT 0 NOT NULL,
	`unit` text DEFAULT '개' NOT NULL,
	`min_quantity` real DEFAULT 1 NOT NULL,
	`location` text,
	`barcode` text,
	`photo_uri` text,
	`notes` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `supplies_category_idx` ON `supplies` (`category`);--> statement-breakpoint
CREATE INDEX `supplies_name_idx` ON `supplies` (`name`);