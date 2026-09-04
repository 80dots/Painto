PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`maker` text,
	`scale` text,
	`status` text DEFAULT 'unbuilt' NOT NULL,
	`quantity` real DEFAULT 1 NOT NULL,
	`purchased_at` integer,
	`price` real,
	`location` text,
	`started_at` integer,
	`finished_at` integer,
	`cover_uri` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "name", "maker", "scale", "status", "quantity", "purchased_at", "price", "location", "started_at", "finished_at", "cover_uri", "notes", "created_at", "updated_at") SELECT "id", "name", "maker", "scale", "status", 1, NULL, NULL, NULL, "started_at", "finished_at", "cover_uri", "notes", "created_at", "updated_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `projects_name_idx` ON `projects` (`name`);--> statement-breakpoint
ALTER TABLE `supplies` ADD `width_mm` real;