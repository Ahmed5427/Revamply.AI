// api/storage.js - Simple in-memory storage for submissions
let submissionsStore = new Map();

class SubmissionStorage {
    static set(id, data) {
        submissionsStore.set(id, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return submissionsStore.get(id);
    }
    
    static get(id) {
        return submissionsStore.get(id) || null;
    }
    
    static has(id) {
        return submissionsStore.has(id);
    }
    
    static delete(id) {
        return submissionsStore.delete(id);
    }
    
    static update(id, updates) {
        const existing = this.get(id);
        if (!existing) return null;
        
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.set(id, updated);
        return updated;
    }
    
    static getAll() {
        return Array.from(submissionsStore.values());
    }
}

export default SubmissionStorage;
