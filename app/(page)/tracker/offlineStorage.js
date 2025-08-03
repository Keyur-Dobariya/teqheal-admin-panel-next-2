import { openDB } from 'idb';

const DB_NAME = 'attendance-tracker';
const STORE_NAME = 'offline-actions';

async function getDB() {
    return await openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
            }
        },
    });
}

export async function saveOfflineAction(action) {
    const db = await getDB();
    await db.put(STORE_NAME, action);
}

export async function getOfflineActions() {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
}

export async function clearOfflineActions() {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.clear();
    await tx.done;
}