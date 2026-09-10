CREATE TABLE `likes` (
	`uuid` text(256) NOT NULL,
	`post_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`uuid` text(36) NOT NULL,
	`name` text(256) NOT NULL,
	`user_id` text(36) NOT NULL,
	`regulation` text(256) NOT NULL,
	`description` text(256),
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`uuid` text(36) NOT NULL,
	`name` text(256) NOT NULL,
	`avatar_icon_url` text(256),
	`email` text(256) NOT NULL,
	`hashed_password` text(256) NOT NULL,
	`login` text(256) NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `likes_uuid_unique` ON `likes` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_uuid_unique` ON `posts` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_uuid_unique` ON `users` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_login_unique` ON `users` (`login`);