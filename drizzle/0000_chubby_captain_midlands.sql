CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"startup_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "startup" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"website_url" text,
	"creator_user" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"startup_request_id" integer
);
--> statement-breakpoint
CREATE TABLE "startup_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_to_startup_request" (
	"startup_id" text NOT NULL,
	"startup_request_id" integer NOT NULL,
	CONSTRAINT "startup_to_startup_request_startup_id_startup_request_id_pk" PRIMARY KEY("startup_id","startup_request_id")
);
--> statement-breakpoint
CREATE TABLE "startup_to_tag" (
	"startup_id" text NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "startup_to_tag_startup_id_tag_id_pk" PRIMARY KEY("startup_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_to_startup" (
	"user_id" text NOT NULL,
	"startup_id" text NOT NULL,
	CONSTRAINT "user_to_startup_user_id_startup_id_pk" PRIMARY KEY("user_id","startup_id")
);
--> statement-breakpoint
CREATE TABLE "user_to_startup_request" (
	"user_id" text NOT NULL,
	"startup_request_id" integer NOT NULL,
	CONSTRAINT "user_to_startup_request_user_id_startup_request_id_pk" PRIMARY KEY("user_id","startup_request_id")
);
--> statement-breakpoint
CREATE TABLE "user_to_tag" (
	"user_id" text NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "user_to_tag_user_id_tag_id_pk" PRIMARY KEY("user_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_startup_id_startup_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup" ADD CONSTRAINT "startup_creator_user_user_id_fk" FOREIGN KEY ("creator_user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup" ADD CONSTRAINT "startup_startup_request_id_startup_request_id_fk" FOREIGN KEY ("startup_request_id") REFERENCES "public"."startup_request"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_to_startup_request" ADD CONSTRAINT "startup_to_startup_request_startup_id_startup_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_to_startup_request" ADD CONSTRAINT "startup_to_startup_request_startup_request_id_startup_request_id_fk" FOREIGN KEY ("startup_request_id") REFERENCES "public"."startup_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_to_tag" ADD CONSTRAINT "startup_to_tag_startup_id_startup_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_to_tag" ADD CONSTRAINT "startup_to_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_startup" ADD CONSTRAINT "user_to_startup_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_startup" ADD CONSTRAINT "user_to_startup_startup_id_startup_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_startup_request" ADD CONSTRAINT "user_to_startup_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_startup_request" ADD CONSTRAINT "user_to_startup_request_startup_request_id_startup_request_id_fk" FOREIGN KEY ("startup_request_id") REFERENCES "public"."startup_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_tag" ADD CONSTRAINT "user_to_tag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_tag" ADD CONSTRAINT "user_to_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;