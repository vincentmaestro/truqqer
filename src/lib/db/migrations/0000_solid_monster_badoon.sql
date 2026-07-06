CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TABLE "driver_locations" (
	"driverId" uuid PRIMARY KEY NOT NULL,
	"location" geometry(point),
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"photo" text NOT NULL,
	"licenseNumber" varchar NOT NULL,
	"licensePhoto" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"isAvailable" boolean DEFAULT false NOT NULL,
	"rating" numeric(4, 2),
	"suspended" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"ip_address" varchar,
	"user_agent" text,
	"createdAt" timestamp DEFAULT '2026-06-13 23:41:37.678' NOT NULL,
	"expiresAt" timestamp NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_locations" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"location" geometry(point),
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"role" varchar DEFAULT 'user' NOT NULL,
	"gender" "gender" NOT NULL,
	"password" text NOT NULL,
	"photo" text,
	"suspended" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driverId" uuid NOT NULL,
	"make" varchar NOT NULL,
	"model" varchar NOT NULL,
	"year" varchar NOT NULL,
	"color" text NOT NULL,
	"photo" text,
	"type" varchar NOT NULL,
	"plateNumber" varchar NOT NULL,
	"registrationDocument" text,
	"insuranceDocument" text,
	"capacity" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_plateNumber_unique" UNIQUE("plateNumber")
);
--> statement-breakpoint
ALTER TABLE "driver_locations" ADD CONSTRAINT "driver_locations_driverId_drivers_id_fk" FOREIGN KEY ("driverId") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_driverId_drivers_id_fk" FOREIGN KEY ("driverId") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "driver_id_idx" ON "driver_locations" USING btree ("driverId");--> statement-breakpoint
CREATE INDEX "driver_location_idx" ON "driver_locations" USING gist ("location");--> statement-breakpoint
CREATE INDEX "approved_index" ON "drivers" USING btree ("approved");--> statement-breakpoint
CREATE INDEX "is_available_index" ON "drivers" USING btree ("isAvailable");--> statement-breakpoint
CREATE INDEX "token_index" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "user_locations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_location_idx" ON "user_locations" USING gist ("location");--> statement-breakpoint
CREATE INDEX "email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "created_at_index" ON "users" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "driver_id_index" ON "vehicle" USING btree ("driverId");--> statement-breakpoint
CREATE INDEX "truck_type_index" ON "vehicle" USING btree ("type");--> statement-breakpoint
CREATE INDEX "truck_photo" ON "vehicle" USING btree ("photo");