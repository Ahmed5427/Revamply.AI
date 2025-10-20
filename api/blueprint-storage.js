// api/blueprint-storage.js - Using ioredis with native Redis URL
import Redis from 'ioredis';

// Create Redis client using KV_REDIS_URL
const redis = new Redis(process.env.KV_REDIS_URL);

class BlueprintStorage {
    static async store(submissionId, blueprintData) {
        try {
            const data = {
                ...blueprintData,
                storedAt: new Date().toISOString(),
                submissionId
            };
            
            // Store in Redis with 7 day expiration (604800 seconds)
            await redis.setex(`blueprint:${submissionId}`, 604800, JSON.stringify(data));
            
            console.log(`✅ Stored blueprint in Redis for submission: ${submissionId}`);
            return true;
        } catch (error) {
            console.error(`❌ Error storing blueprint for ${submissionId}:`, error);
            return false;
        }
    }
    
    static async retrieve(submissionId) {
        try {
            console.log(`🔍 Retrieving blueprint from Redis: ${submissionId}`);
            
            const data = await redis.get(`blueprint:${submissionId}`);
            
            if (data) {
                const blueprint = JSON.parse(data);
                console.log(`✅ Retrieved blueprint from Redis for: ${submissionId}`);
                return blueprint;
            }
            
            console.log(`❌ Blueprint not found in Redis for: ${submissionId}`);
            return null;
        } catch (error) {
            console.error(`❌ Error retrieving blueprint for ${submissionId}:`, error);
            return null;
        }
    }
    
    static async exists(submissionId) {
        try {
            const exists = await redis.exists(`blueprint:${submissionId}`);
            return exists === 1;
        } catch (error) {
            console.error(`❌ Error checking blueprint existence for ${submissionId}:`, error);
            return false;
        }
    }
    
    static async delete(submissionId) {
        try {
            await redis.del(`blueprint:${submissionId}`);
            console.log(`🗑️ Deleted blueprint from Redis for: ${submissionId}`);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting blueprint for ${submissionId}:`, error);
            return false;
        }
    }
    
    static async listAll() {
        try {
            const keys = await redis.keys('blueprint:*');
            console.log(`📋 Total blueprints in Redis: ${keys.length}`);
            return keys.map(key => key.replace('blueprint:', ''));
        } catch (error) {
            console.error('❌ Error listing blueprints:', error);
            return [];
        }
    }
}

export default BlueprintStorage;
```

### Step 3: Commit Both Changes

1. Update `package.json` - commit
2. Update `api/blueprint-storage.js` - commit
3. GitHub will trigger auto-deploy

### Step 4: Test

After deployment (1-2 minutes):
```
https://revamply-ai.vercel.app/api/test-storage
