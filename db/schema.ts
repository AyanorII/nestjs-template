import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Provider = "github" | "google" | "local";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface RefreshTokens {
  expires_at: Timestamp;
  id: Generated<string>;
  issued_at: Timestamp;
  token: string;
  user_id: string;
}

export interface Users {
  email: string;
  first_name: string | null;
  id: Generated<string>;
  last_name: string | null;
  password: string | null;
  password_salt: string | null;
  photo_url: string | null;
  provider: Provider;
}

export interface DB {
  refresh_tokens: RefreshTokens;
  users: Users;
}
