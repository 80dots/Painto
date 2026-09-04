CREATE TABLE `dashboard_cards` (
	`card_id` text PRIMARY KEY NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `paints` ADD `thinner_ratio` text;--> statement-breakpoint
CREATE INDEX `paints_barcode_idx` ON `paints` (`barcode`);