import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'painto.db';

/**
 * 앱 전역에서 쓰는 SQLite 핸들.
 * enableChangeListener 를 켜야 useLiveQuery 가 변경을 감지한다.
 */
export const sqliteDb = SQLite.openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
});

// 외래키 제약(cascade 삭제 등)은 연결마다 명시적으로 켜야 한다.
sqliteDb.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqliteDb, { schema });

export type Database = typeof db;
