CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"billing_rate" numeric(10, 2) NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"weekly_schedule_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"target_hours" numeric(5, 2) NOT NULL,
	"goal" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"weekly_schedule_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"target_id" integer,
	"date" date NOT NULL,
	"estimated_hours" numeric(5, 2) NOT NULL,
	"actual_hours" numeric(5, 2) DEFAULT '0' NOT NULL,
	"notes" text NOT NULL,
	"billable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"week" integer NOT NULL,
	"overall_goal" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_weekly_schedule_id_weekly_schedules_id_fk" FOREIGN KEY ("weekly_schedule_id") REFERENCES "public"."weekly_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_weekly_schedule_id_weekly_schedules_id_fk" FOREIGN KEY ("weekly_schedule_id") REFERENCES "public"."weekly_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE no action ON UPDATE no action;