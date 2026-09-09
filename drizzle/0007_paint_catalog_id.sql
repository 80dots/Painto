ALTER TABLE `paints` ADD `catalog_id` text;--> statement-breakpoint
CREATE INDEX `paints_catalog_id_idx` ON `paints` (`catalog_id`);