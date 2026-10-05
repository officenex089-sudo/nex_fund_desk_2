CREATE TABLE `connections` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`label` text NOT NULL,
	`token` text NOT NULL,
	`meta_id` text,
	`accounts` text,
	`error` text,
	`checked_at` text,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
INSERT INTO connections(owner,id,label,token) SELECT owner,'legacy','Existing Facebook connection',token FROM settings;
--> statement-breakpoint
DELETE FROM settings;
