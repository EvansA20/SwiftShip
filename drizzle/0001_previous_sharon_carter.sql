CREATE TABLE `shipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackingId` varchar(32) NOT NULL,
	`recipientName` varchar(160) NOT NULL,
	`destinationCity` varchar(160) NOT NULL,
	`parcelDescription` varchar(180) NOT NULL,
	`assignedDriver` varchar(120),
	`status` enum('registered','dispatched','in_transit','out_for_delivery','delivered','exception') NOT NULL DEFAULT 'registered',
	`latestLocation` varchar(180),
	`dispatchDate` timestamp,
	`estimatedDelivery` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipments_trackingId_unique` UNIQUE(`trackingId`)
);
--> statement-breakpoint
CREATE TABLE `trackingCounters` (
	`year` int NOT NULL,
	`lastValue` int NOT NULL DEFAULT 0,
	CONSTRAINT `trackingCounters_year` PRIMARY KEY(`year`)
);
--> statement-breakpoint
CREATE TABLE `trackingEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shipmentId` int NOT NULL,
	`status` enum('registered','dispatched','in_transit','out_for_delivery','delivered','exception') NOT NULL,
	`location` varchar(180),
	`note` varchar(240),
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trackingEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trackingEvents` ADD CONSTRAINT `trackingEvents_shipmentId_shipments_id_fk` FOREIGN KEY (`shipmentId`) REFERENCES `shipments`(`id`) ON DELETE cascade ON UPDATE no action;