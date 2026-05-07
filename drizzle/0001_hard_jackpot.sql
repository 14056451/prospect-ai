CREATE TABLE `consultationMemos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`aiSummary` text,
	`aiActions` json,
	`consultationDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultationMemos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`occupation` varchar(255),
	`company` varchar(255),
	`status` enum('1차상담','2차','소비자','사업자') NOT NULL DEFAULT '1차상담',
	`nextContactDate` timestamp,
	`purchaseItem` varchar(255),
	`purchaseQuantity` int,
	`purchasePrice` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`month` timestamp NOT NULL,
	`consultationCount` int NOT NULL DEFAULT 0,
	`conversionRate` decimal(5,2) NOT NULL DEFAULT '0',
	`topKeywords` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','premium') NOT NULL DEFAULT 'free',
	`isActive` boolean NOT NULL DEFAULT true,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`)
);
