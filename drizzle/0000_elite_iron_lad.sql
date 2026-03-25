CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"topic" text NOT NULL,
	"chosen_option" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
