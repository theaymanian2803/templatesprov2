CREATE TABLE `downloads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`template_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `downloads_template_idx` ON `downloads` (`template_id`);--> statement-breakpoint
CREATE INDEX `downloads_user_idx` ON `downloads` (`user_id`);--> statement-breakpoint
ALTER TABLE `templates` ADD `download_count` integer DEFAULT 0 NOT NULL;