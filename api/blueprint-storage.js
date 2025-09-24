// api/blueprint-storage.js - Simple file-based storage for blueprints
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = '/tmp/blueprints'; // Vercel /tmp directory

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

class BlueprintStorage {
    static store(submissionId, blueprintData) {
        try {
            const filePath = path.join(STORAGE_DIR, `${submissionId}.json`);
            const data = {
                ...blueprintData,
                storedAt: new Date().toISOString(),
                submissionId
            };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`📁 Stored blueprint for submission: ${submissionId}`);
            return true;
        } catch (error) {
            console.error('Error storing blueprint:', error);
            return false;
        }
    }
    
    static retrieve(submissionId) {
        try {
            const filePath = path.join(STORAGE_DIR, `${submissionId}.json`);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                const blueprint = JSON.parse(data);
                console.log(`📖 Retrieved blueprint for submission: ${submissionId}`);
                return blueprint;
            }
            console.log(`❌ Blueprint not found for submission: ${submissionId}`);
            return null;
        } catch (error) {
            console.error('Error retrieving blueprint:', error);
            return null;
        }
    }
    
    static exists(submissionId) {
        const filePath = path.join(STORAGE_DIR, `${submissionId}.json`);
        return fs.existsSync(filePath);
    }
    
    static delete(submissionId) {
        try {
            const filePath = path.join(STORAGE_DIR, `${submissionId}.json`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deleted blueprint for submission: ${submissionId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting blueprint:', error);
            return false;
        }
    }
}

export default BlueprintStorage;
