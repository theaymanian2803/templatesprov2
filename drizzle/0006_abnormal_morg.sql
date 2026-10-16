CREATE TABLE `landing_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`section_key` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `landing_sections_section_key_unique` ON `landing_sections` (`section_key`);