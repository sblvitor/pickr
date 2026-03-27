CREATE TYPE "public"."session_status" AS ENUM('open', 'deciding', 'chosen', 'closed');--> statement-breakpoint
CREATE TABLE "session_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"nickname" text NOT NULL,
	"is_host" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"created_by_member_id" uuid,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_code_unique";--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "status" "session_status" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "chosen_option_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session_members" ADD CONSTRAINT "session_members_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_options" ADD CONSTRAINT "session_options_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_options" ADD CONSTRAINT "session_options_created_by_member_id_session_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."session_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_members_session_id_idx" ON "session_members" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_members_session_id_nickname_unique" ON "session_members" USING btree ("session_id","nickname");--> statement-breakpoint
CREATE INDEX "session_options_session_id_idx" ON "session_options" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_options_created_by_member_id_idx" ON "session_options" USING btree ("created_by_member_id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_chosen_option_id_session_options_id_fk" FOREIGN KEY ("chosen_option_id") REFERENCES "public"."session_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_code_unique" ON "sessions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "sessions_status_idx" ON "sessions" USING btree ("status");--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "chosen_option";