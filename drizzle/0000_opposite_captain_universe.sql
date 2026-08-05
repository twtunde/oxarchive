CREATE TYPE "public"."ebook_format" AS ENUM('pdf', 'epub', 'pdf_epub');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."download_link_state" AS ENUM('active', 'expired', 'needs_regeneration');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ebooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"title" varchar(240) NOT NULL,
	"slug" varchar(260) NOT NULL,
	"author" varchar(180) NOT NULL,
	"description" text NOT NULL,
	"cover_image_url" text,
	"cloudinary_public_id" varchar(255) NOT NULL,
	"format" "ebook_format" DEFAULT 'pdf' NOT NULL,
	"edition" varchar(80),
	"price_in_kobo" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ebooks_slug_unique" UNIQUE("slug"),
	CONSTRAINT "ebooks_cloudinary_public_id_unique" UNIQUE("cloudinary_public_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"ebook_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_in_kobo" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_token" varchar(64) NOT NULL,
	"buyer_email" varchar(320) NOT NULL,
	"user_id" uuid,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_provider_reference" varchar(128),
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"total_amount_in_kobo" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"ebook_id" uuid NOT NULL,
	"user_id" uuid,
	"buyer_email" varchar(320) NOT NULL,
	"access_token" varchar(86) NOT NULL,
	"link_state" "download_link_state" DEFAULT 'active' NOT NULL,
	"download_expires_at" timestamp with time zone NOT NULL,
	"last_issued_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_order_item_id_unique" UNIQUE("order_item_id"),
	CONSTRAINT "purchases_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
ALTER TABLE "ebooks" ADD CONSTRAINT "ebooks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_ebook_id_ebooks_id_fk" FOREIGN KEY ("ebook_id") REFERENCES "public"."ebooks"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_ebook_id_ebooks_id_fk" FOREIGN KEY ("ebook_id") REFERENCES "public"."ebooks"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ebooks_slug_idx" ON "ebooks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ebooks_category_idx" ON "ebooks" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "ebooks_published_idx" ON "ebooks" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "ebooks_price_idx" ON "ebooks" USING btree ("price_in_kobo");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_ebook_id_idx" ON "order_items" USING btree ("ebook_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_token_unique" ON "orders" USING btree ("order_token");--> statement-breakpoint
CREATE INDEX "orders_buyer_email_idx" ON "orders" USING btree ("buyer_email");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "purchases_access_token_idx" ON "purchases" USING btree ("access_token");--> statement-breakpoint
CREATE INDEX "purchases_buyer_email_idx" ON "purchases" USING btree ("buyer_email");--> statement-breakpoint
CREATE INDEX "purchases_user_id_idx" ON "purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "purchases_order_id_idx" ON "purchases" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "purchases_link_state_idx" ON "purchases" USING btree ("link_state");--> statement-breakpoint
CREATE INDEX "purchases_download_expiry_idx" ON "purchases" USING btree ("download_expires_at");