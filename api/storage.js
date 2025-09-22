import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_FILE = path.resolve(process.cwd(), 'submissions.json');

let submissionsCache = new Map();
let isInitialized = false;

async function initializeStorage() {
    if (isInitialized) return;
    try {
        const data = await fs.readFile(STORAGE_FILE, 'utf8');
        const parsedData = JSON.parse(data);
        submissionsCache = new Map(Object.entries(parsedData));
        console.log('Submissions loaded from file.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Submissions file not found, starting with empty storage.');
            await fs.writeFile(STORAGE_FILE, JSON.stringify({}), 'utf8');
        } else {
            console.error('Error initializing storage:', error);
        }
    }
    isInitialized = true;
}

async function saveStorage() {
    try {
        const dataToSave = Object.fromEntries(submissionsCache);
        await fs.writeFile(STORAGE_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
        console.log('Submissions saved to file.');
    } catch (error) {
        console.error('Error saving storage:', error);
    }
}

class SubmissionStorage {
    static async init() {
        await initializeStorage();
    }

    static async set(id, data) {
        await initializeStorage();
        submissionsCache.set(id, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        await saveStorage();
        return submissionsCache.get(id);
    }
    
    static async get(id) {
        await initializeStorage();
        return submissionsCache.get(id) || null;
    }
    
    static async has(id) {
        await initializeStorage();
        return submissionsCache.has(id);
    }
    
    static async delete(id) {
        await initializeStorage();
        const result = submissionsCache.delete(id);
        await saveStorage();
        return result;
    }
    
    static async update(id, updates) {
        await initializeStorage();
        const existing = await this.get(id);
        if (!existing) return null;
        
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        await this.set(id, updated);
        return updated;
    }
    
    static async getAll() {
        await initializeStorage();
        return Array.from(submissionsCache.values());
    }
}

export default SubmissionStorage;
