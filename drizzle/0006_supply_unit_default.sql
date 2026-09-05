PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_supplies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'etc' NOT NULL,
	`brand` text,
	`spec` text,
	`width_mm` real,
	`quantity` real DEFAULT 0 NOT NULL,
	`unit` text DEFAULT 'ea' NOT NULL,
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
INSERT INTO `__new_supplies`("id", "name", "category", "brand", "spec", "width_mm", "quantity", "unit", "min_quantity", "location", "barcode", "photo_uri", "notes", "is_archived", "created_at", "updated_at") SELECT "id", "name", "category", "brand", "spec", "width_mm", "quantity", "unit", "min_quantity", "location", "barcode", "photo_uri", "notes", "is_archived", "created_at", "updated_at" FROM `supplies`;--> statement-breakpoint
DROP TABLE `supplies`;--> statement-breakpoint
ALTER TABLE `__new_supplies` RENAME TO `supplies`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `supplies_category_idx` ON `supplies` (`category`);--> statement-breakpoint
CREATE INDEX `supplies_name_idx` ON `supplies` (`name`);