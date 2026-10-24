CREATE TYPE "public"."caption_status" AS ENUM('draft', 'pending_review', 'changes_requested', 'approved', 'published');--> statement-breakpoint
CREATE TYPE "public"."channel" AS ENUM('Facebook');--> statement-breakpoint
CREATE TYPE "public"."review_result" AS ENUM('pending', 'approved', 'changes_requested');--> statement-breakpoint
CREATE TABLE "caption_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caption_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"text" text NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"review_result" "review_result" DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "captions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"brand" text DEFAULT '' NOT NULL,
	"channel" "channel" NOT NULL,
	"scheduled_date" date,
	"author_name" text DEFAULT '' NOT NULL,
	"image_url" text,
	"status" "caption_status" DEFAULT 'draft' NOT NULL,
	"pending_draft_text" text DEFAULT '' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"quoted_text" text,
	"image_url" text,
	"note" text NOT NULL,
	"suggested_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "caption_versions" ADD CONSTRAINT "caption_versions_caption_id_captions_id_fk" FOREIGN KEY ("caption_id") REFERENCES "public"."captions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_notes" ADD CONSTRAINT "review_notes_version_id_caption_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."caption_versions"("id") ON DELETE cascade ON UPDATE no action;