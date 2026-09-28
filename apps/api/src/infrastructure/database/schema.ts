import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const roleName = pgEnum('role_name', ['SUPERVISOR', 'TEACHER']);

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  personnelCode: text('personnel_code').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: roleName('name').notNull().unique(),
});

export const accountRoles = pgTable(
  'account_roles',
  {
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.roleId] })],
);

// This intentionally contains only the identity link required by authentication.
export const teachers = pgTable('teachers', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id')
    .unique()
    .references(() => accounts.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    invalidatedAt: timestamp('invalidated_at', { withTimezone: true }),
  },
  (table) => [index('sessions_token_hash_idx').on(table.tokenHash)],
);

export const securityAuditEvents = pgTable('security_audit_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type').notNull(),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  personnelCode: text('personnel_code'),
  ipAddress: text('ip_address'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
});

export const accountsRelations = relations(accounts, ({ many, one }) => ({
  accountRoles: many(accountRoles),
  teacher: one(teachers),
}));
export const rolesRelations = relations(roles, ({ many }) => ({
  accountRoles: many(accountRoles),
}));
export const accountRolesRelations = relations(accountRoles, ({ one }) => ({
  account: one(accounts, { fields: [accountRoles.accountId], references: [accounts.id] }),
  role: one(roles, { fields: [accountRoles.roleId], references: [roles.id] }),
}));
