CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"team" varchar(160) NOT NULL,
	"role" varchar(160) NOT NULL,
	"personality" text NOT NULL,
	"system_prompt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
