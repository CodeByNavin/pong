// db.ts
import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';

interface DBData {
    [key: string]: any;
}

const dbPath = path.join(process.cwd(), "db.json")
const db = await JSONFilePreset<DBData>(dbPath, {});

// Initialize the database once
export async function initDb(): Promise<void> {
    await db.read(); // This will read from the file
    if (!db.data) {
        db.data = {};
        await db.write();
    }
}

// Read all data
export async function readData(key: any): Promise<any> {
    await initDb();

    return db.data[key];
}

export async function addOrUpdateRoom(roomId: string, roomData: any): Promise<void> {
    await initDb();
    if (
        !db.data.rooms ||
        typeof db.data.rooms !== "object" ||
        Array.isArray(db.data.rooms)
    ) {
        db.data.rooms = {};
    }
    db.data.rooms[roomId] = roomData;
    await db.write();
}
// Edit (update) a key (same as write, but you can add checks)
export async function editData(key: string, value: any): Promise<void> {
    await initDb();

    if (db.data[key] !== undefined) {
        db.data[key] = value;
        await db.write();
    } else {
        throw new Error(`Key "${key}" does not exist.`);
    }
}

// Delete a key
export async function deleteData(key: string): Promise<void> {
    await initDb();

    if (db.data[key] !== undefined) {
        delete db.data[key];
        await db.write();
    } else {
        throw new Error(`Key "${key}" does not exist.`);
    }
}