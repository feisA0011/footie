import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const DEFAULT_DB_PATH = resolve(PACKAGE_ROOT, '..', '..', 'footie.db');

export const resolveDbPath = () => process.env['FOOTIE_DB_PATH'] ?? DEFAULT_DB_PATH;
