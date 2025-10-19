// api/blueprint-storage.js - Fixed to prevent crashes on Vercel
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = '/tmp/blueprints'; // Vercel /tmp directory

// ✅ LAZY directory creation - only when needed, not during import
function ensureStorageDir() {
    try {
        if (!fs.existsSync(STORAGE_DIR)) {
            fs.mkdirSync(STORAGE_DIR, { recursive: true });
            console.log(`📁 Created storage directory: ${STORAGE_DIR}`);
        }
        return true;
    } catch (error) {
        console.error('❌ Error creating storage directory:', error);
        return false;
    }
}

class BlueprintStorage {
    static store(submissionId, blueprintData) {
        try {
            // Ensure directory exists before writing
            if (!ensureStorageDir()) {
                console.error('Failed to create storage directory');
                return false;
            }
            
            const filePath = path.join(STORAGE_DIR, `${submissionId}.json`);
            const data = {
                ...blueprintData,
                storedAt: new Date().toISOString(),
                submissionId
            };
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`✅ Stored blueprint for submission: ${submissionId}`);
            console.log(`📍 File path: ${filePath}`);
            return true;
        } catch (error) {
            console.error(`❌ Error storing blueprint for ${submissionId}:`, error);
            return false;
        }
    }
    
    static retrieve(submissionId) {
        try {
            // Ensure directory exists before reading
            if (!ensureStorageDir()) {
                console.error('Storage directory not available');
                return null;
            }
            
            const filePath = path.join(STORAGE_DIR, `${submissionId}.json`);
            console.log(`🔍 Looking for blueprint at: ${filePath}`);
            
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                const blueprint = JSON.parse(data);
                console.log(`✅ Retrieved blueprint for submission: ${submissionId}`);
                return blueprint;
            }
            
            console.log(`❌ Blueprint file not found for submission: ${submissionId}`);
            
            // Debug: List all files in storage directory
            try {
                const files = fs.readdirSync(STORAGE_DIR);
                console.log(`📂 Available blueprints: ${files.join(', ')}`);
            } catch (e) {
                console.log('📂 Storage directory is empty or unreadable');
            }
            
            return null;
        } catch (error) {
            console.error(`❌ Error retrieving blueprint for ${submissionId}:`, error);
            return null;
        }
    }
    
    static exists(submissionId) {
        try {
            if (!ensureStorageDir()) {
                return false;
            }
            
            const filePath = path.join(STORAGE_DIR, `${submissionId}.json`);
            return fs.existsSync(filePath);
        } catch (error) {
            console.error(`❌ Error checking blueprint existence for ${submissionId}:`, error);
            return false;
        }
    }
    
    static delete(submissionId) {
        try {
            const filePath = path.join(STORAGE_DIR, `${submissionId}.json`);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deleted blueprint for submission: ${submissionId}`);
                return true;
            }
            
            console.log(`⚠️ Blueprint not found for deletion: ${submissionId}`);
            return false;
        } catch (error) {
            console.error(`❌ Error deleting blueprint for ${submissionId}:`, error);
            return false;
        }
    }
    
    // Helper method to list all stored blueprints (for debugging)
    static listAll() {
        try {
            if (!ensureStorageDir()) {
                return [];
            }
            
            const files = fs.readdirSync(STORAGE_DIR);
            console.log(`📋 Total blueprints stored: ${files.length}`);
            return files.map(f => f.replace('.json', ''));
        } catch (error) {
            console.error('❌ Error listing blueprints:', error);
            return [];
        }
    }
}

export default BlueprintStorage;
