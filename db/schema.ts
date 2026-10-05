import {sqliteTable,text,integer,primaryKey,index} from 'drizzle-orm/sqlite-core';
export const settings=sqliteTable('settings',{owner:text('owner').primaryKey(),token:text('token').notNull()});
export const snapshots=sqliteTable('snapshots',{owner:text('owner').notNull(),id:text('id').notNull(),payload:text('payload').notNull()},t=>[primaryKey({columns:[t.owner,t.id]})]);
export const clients=sqliteTable('clients',{owner:text('owner').notNull(),id:text('id').notNull(),payload:text('payload').notNull()},t=>[primaryKey({columns:[t.owner,t.id]})]);

export const connections=sqliteTable('connections',{owner:text('owner').notNull(),id:text('id').notNull(),label:text('label').notNull(),token:text('token').notNull(),metaId:text('meta_id'),accounts:text('accounts'),error:text('error'),checkedAt:text('checked_at')},t=>[primaryKey({columns:[t.owner,t.id]})]);
export const teamWorkspace=sqliteTable('team_workspace',{id:text('id').primaryKey(),owner:text('owner').notNull()});
export const dashboardMembers=sqliteTable('dashboard_members',{id:text('id').primaryKey(),email:text('email').notNull().unique(),passwordHash:text('password_hash').notNull(),revision:integer('revision').notNull().default(1),createdAt:text('created_at').notNull()});
export const dashboardSessions=sqliteTable('dashboard_sessions',{tokenHash:text('token_hash').primaryKey(),userId:text('user_id').notNull(),stamp:text('stamp').notNull(),expires:integer('expires').notNull()},t=>[index('dashboard_sessions_expiry').on(t.expires)]);
export const authAttempts=sqliteTable('auth_attempts',{key:text('key').primaryKey(),window:integer('window').notNull(),count:integer('count').notNull(),expires:integer('expires').notNull()});
