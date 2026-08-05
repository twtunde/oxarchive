CREATE TABLE "bank_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_name" varchar(160) NOT NULL,
	"account_number" varchar(32) NOT NULL,
	"account_name" varchar(160) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "buyer_name" varchar(160) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "buyer_confirmed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "bank_settings_is_active_idx" ON "bank_settings" USING btree ("is_active");