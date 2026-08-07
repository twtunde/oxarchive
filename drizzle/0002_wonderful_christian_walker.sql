CREATE TYPE "public"."publisher_payout_status" AS ENUM('pending', 'disbursed');--> statement-breakpoint
CREATE TYPE "public"."publisher_payout_method" AS ENUM('bank', 'paypal', 'payoneer');--> statement-breakpoint
CREATE TYPE "public"."publisher_submission_status" AS ENUM('draft', 'pending_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "publisher_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"ebook_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"gross_sale_in_kobo" integer NOT NULL,
	"platform_fee_in_kobo" integer NOT NULL,
	"publisher_net_in_kobo" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"payout_month" varchar(7) NOT NULL,
	"payout_status" "publisher_payout_status" DEFAULT 'pending' NOT NULL,
	"disbursed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publisher_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pseudonym" varchar(180) NOT NULL,
	"contact_email" varchar(320) NOT NULL,
	"title" varchar(240) NOT NULL,
	"author_display_name" varchar(180) NOT NULL,
	"description" text NOT NULL,
	"category_id" uuid,
	"edition" varchar(80),
	"format" "ebook_format" DEFAULT 'pdf' NOT NULL,
	"suggested_price_in_kobo" integer NOT NULL,
	"admin_final_price_in_kobo" integer,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"cover_image_url" text,
	"cloudinary_public_id" varchar(255) NOT NULL,
	"payout_method" "publisher_payout_method" NOT NULL,
	"bank_account_name" varchar(180),
	"bank_account_number" varchar(80),
	"bank_code_swift" varchar(80),
	"paypal_email" varchar(320),
	"payoneer_email" varchar(320),
	"status" "publisher_submission_status" DEFAULT 'draft' NOT NULL,
	"review_notes" text,
	"approved_ebook_id" uuid,
	"listing_url" text,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publisher_submissions_cloudinary_public_id_unique" UNIQUE("cloudinary_public_id")
);
--> statement-breakpoint
ALTER TABLE "publisher_earnings" ADD CONSTRAINT "publisher_earnings_submission_id_publisher_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."publisher_submissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "publisher_earnings" ADD CONSTRAINT "publisher_earnings_ebook_id_ebooks_id_fk" FOREIGN KEY ("ebook_id") REFERENCES "public"."ebooks"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "publisher_earnings" ADD CONSTRAINT "publisher_earnings_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "publisher_earnings" ADD CONSTRAINT "publisher_earnings_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "publisher_submissions" ADD CONSTRAINT "publisher_submissions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "publisher_submissions" ADD CONSTRAINT "publisher_submissions_approved_ebook_id_ebooks_id_fk" FOREIGN KEY ("approved_ebook_id") REFERENCES "public"."ebooks"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "publisher_earnings_order_item_unique" ON "publisher_earnings" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "publisher_earnings_submission_idx" ON "publisher_earnings" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "publisher_earnings_payout_month_idx" ON "publisher_earnings" USING btree ("payout_month");--> statement-breakpoint
CREATE INDEX "publisher_earnings_payout_status_idx" ON "publisher_earnings" USING btree ("payout_status");--> statement-breakpoint
CREATE INDEX "publisher_submissions_status_idx" ON "publisher_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "publisher_submissions_created_idx" ON "publisher_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "publisher_submissions_email_idx" ON "publisher_submissions" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "publisher_submissions_pseudonym_idx" ON "publisher_submissions" USING btree ("pseudonym");