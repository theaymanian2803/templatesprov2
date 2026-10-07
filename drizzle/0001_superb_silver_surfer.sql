CREATE TABLE `license_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`template_id` text NOT NULL,
	`product` text NOT NULL,
	`key` text NOT NULL,
	`order_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `license_keys_user_template_idx` ON `license_keys` (`user_id`,`template_id`);--> statement-breakpoint
ALTER TABLE `templates` ADD `license_product` text;