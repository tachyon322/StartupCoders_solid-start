create table
    "user" (
        "id" text not null primary key,
        "name" text not null,
        "username" text unique,
        "description" text,
        "email" text not null unique,
        "emailVerified" boolean not null,
        "image" text,
        "createdAt" timestamp not null,
        "updatedAt" timestamp not null
    );

create table
    "session" (
        "id" text not null primary key,
        "expiresAt" timestamp not null,
        "token" text not null unique,
        "createdAt" timestamp not null,
        "updatedAt" timestamp not null,
        "ipAddress" text,
        "userAgent" text,
        "userId" text not null references "user" ("id")
    );

create table
    "account" (
        "id" text not null primary key,
        "accountId" text not null,
        "providerId" text not null,
        "userId" text not null references "user" ("id"),
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" timestamp,
        "refreshTokenExpiresAt" timestamp,
        "scope" text,
        "password" text,
        "createdAt" timestamp not null,
        "updatedAt" timestamp not null
    );

create table
    "verification" (
        "id" text not null primary key,
        "identifier" text not null,
        "value" text not null,
        "expiresAt" timestamp not null,
        "createdAt" timestamp,
        "updatedAt" timestamp
    );

-- Tags table
create table
    "tag" (
        "id" integer not null primary key,
        "name" text not null unique
    );

-- StartupRequest table
create table
    "startup_request" (
        "id" serial primary key,
        "message" text not null,
        "createdAt" timestamp not null default current_timestamp,
        "updatedAt" timestamp not null default current_timestamp
    );

-- Startup table
create table
    "startup" (
        "id" text not null primary key default gen_random_uuid(),
        "name" text not null,
        "description" text not null,
        "websiteUrl" text,
        "creatorUser" text not null references "user" ("id") on delete cascade,
        "startupRequestId" integer references "startup_request" ("id"),
        "createdAt" timestamp not null default current_timestamp,
        "updatedAt" timestamp not null default current_timestamp
    );

-- Images table
create table
    "images" (
        "id" text not null primary key default gen_random_uuid(),
        "url" text not null,
        "startupId" text not null references "startup" ("id") on delete cascade
    );

-- Junction table for Tag to User (many-to-many)
create table
    "tag_to_user" (
        "tagId" integer not null references "tag" ("id") on delete cascade,
        "userId" text not null references "user" ("id") on delete cascade,
        primary key ("tagId", "userId")
    );

-- Junction table for Tag to Startup (many-to-many)
create table
    "tag_to_startup" (
        "tagId" integer not null references "tag" ("id") on delete cascade,
        "startupId" text not null references "startup" ("id") on delete cascade,
        primary key ("tagId", "startupId")
    );

-- Junction table for User to Startup participants (many-to-many)
create table
    "startup_participants" (
        "userId" text not null references "user" ("id") on delete cascade,
        "startupId" text not null references "startup" ("id") on delete cascade,
        primary key ("userId", "startupId")
    );

-- Junction table for StartupRequest to User requestBy (many-to-many)
create table
    "startup_request_users" (
        "startupRequestId" integer not null references "startup_request" ("id") on delete cascade,
        "userId" text not null references "user" ("id") on delete cascade,
        primary key ("startupRequestId", "userId")
    );

-- Junction table for StartupRequest to Startup (many-to-many)
create table
    "startup_request_startups" (
        "startupRequestId" integer not null references "startup_request" ("id") on delete cascade,
        "startupId" text not null references "startup" ("id") on delete cascade,
        primary key ("startupRequestId", "startupId")
    );

-- Create indexes for better query performance
create index "idx_tag_name" on "tag" ("name");
create index "idx_startup_name" on "startup" ("name");
create index "idx_startup_creator" on "startup" ("creatorUser");
create index "idx_startup_request_id" on "startup" ("startupRequestId");
create index "idx_images_startup" on "images" ("startupId");
create index "idx_tag_to_user_user" on "tag_to_user" ("userId");
create index "idx_tag_to_startup_startup" on "tag_to_startup" ("startupId");
create index "idx_startup_participants_startup" on "startup_participants" ("startupId");
create index "idx_startup_request_users_user" on "startup_request_users" ("userId");
create index "idx_startup_request_startups_startup" on "startup_request_startups" ("startupId");

-- Add triggers for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new."updatedAt" = current_timestamp;
    return new;
end;
$$ language plpgsql;

create trigger update_startup_updated_at before update on "startup"
    for each row execute function update_updated_at_column();

create trigger update_startup_request_updated_at before update on "startup_request"
    for each row execute function update_updated_at_column();