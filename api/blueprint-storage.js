// api/blueprint-storage.js - Using Vercel KV for persistent storage
import { kv } from '@vercel/kv';

class BlueprintStorage {
    static async store(submissionId, blueprintData) {
        try {
            const data = {
                ...blueprintData,
                storedAt: new Date().toISOString(),
                submissionId
            };
            
            // Store in Vercel KV with 7 day expiration
            await kv.set(`blueprint:${submissionId}`, data, { ex: 604800 });
            
            console.log(`✅ Stored blueprint in KV for submission: ${submissionId}`);
            return true;
        } catch (error) {
            console.error(`❌ Error storing blueprint for ${submissionId}:`, error);
            return false;
        }
    }
    
    static async retrieve(submissionId) {
        try {
            console.log(`🔍 Retrieving blueprint from KV: ${submissionId}`);
            
            const blueprint = await kv.get(`blueprint:${submissionId}`);
            
            if (blueprint) {
                console.log(`✅ Retrieved blueprint from KV for: ${submissionId}`);
                return blueprint;
            }
            
            console.log(`❌ Blueprint not found in KV for: ${submissionId}`);
            return null;
        } catch (error) {
            console.error(`❌ Error retrieving blueprint for ${submissionId}:`, error);
            return null;
        }
    }
    
    static async exists(submissionId) {
        try {
            const exists = await kv.exists(`blueprint:${submissionId}`);
            return exists === 1;
        } catch (error) {
            console.error(`❌ Error checking blueprint existence for ${submissionId}:`, error);
            return false;
        }
    }
    
    static async delete(submissionId) {
        try {
            await kv.del(`blueprint:${submissionId}`);
            console.log(`🗑️ Deleted blueprint from KV for: ${submissionId}`);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting blueprint for ${submissionId}:`, error);
            return false;
        }
    }
    
    static async listAll() {
        try {
            const keys = [];
            let cursor = 0;
            
            do {
                const result = await kv.scan(cursor, { match: 'blueprint:*', count: 100 });
                cursor = result[0];
                keys.push(...result[1]);
            } while (cursor !== 0);
            
            console.log(`📋 Total blueprints in KV: ${keys.length}`);
            return keys.map(key => key.replace('blueprint:', ''));
        } catch (error) {
            console.error('❌ Error listing blueprints:', error);
            return [];
        }
    }
}

export default BlueprintStorage;
