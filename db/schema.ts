import {sqliteTable,text,primaryKey} from 'drizzle-orm/sqlite-core';
export const settings=sqliteTable('settings',{owner:text('owner').primaryKey(),token:text('token').notNull()});
export const snapshots=sqliteTable('snapshots',{owner:text('owner').notNull(),id:text('id').notNull(),payload:text('payload').notNull()},t=>[primaryKey({columns:[t.owner,t.id]})]);
export const clients=sqliteTable('clients',{owner:text('owner').notNull(),id:text('id').notNull(),payload:text('payload').notNull()},t=>[primaryKey({columns:[t.owner,t.id]})]);

export const connections=sqliteTable('connections',{owner:text('owner').notNull(),id:text('id').notNull(),label:text('label').notNull(),token:text('token').notNull(),metaId:text('meta_id'),accounts:text('accounts'),error:text('error'),checkedAt:text('checked_at')},t=>[primaryKey({columns:[t.owner,t.id]})]);
export const teamWorkspace=sqliteTable('team_workspace',{id:text('id').primaryKey(),owner:text('owner').notNull()});
