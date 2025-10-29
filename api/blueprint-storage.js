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

            // Also store email-to-submissionId mapping if email exists
            if (blueprintData.contactEmail) {
                const emailKey = `email:${blueprintData.contactEmail.toLowerCase()}`;
                await redis.setex(emailKey, 604800, submissionId);
                console.log(`✅ Stored email mapping for: ${blueprintData.contactEmail}`);
            }

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

    static async retrieveByEmail(email) {
        try {
            const emailKey = `email:${email.toLowerCase()}`;
            console.log(`🔍 Looking up submissionId for email: ${email}`);

            const submissionId = await redis.get(emailKey);

            if (submissionId) {
                console.log(`✅ Found submissionId for email: ${email} -> ${submissionId}`);
                // Now retrieve the actual blueprint
                return await this.retrieve(submissionId);
            }

            console.log(`❌ No blueprint found for email: ${email}`);
            return null;
        } catch (error) {
            console.error(`❌ Error retrieving blueprint by email ${email}:`, error);
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

    static async emailExists(email) {
        try {
            const emailKey = `email:${email.toLowerCase()}`;
            const exists = await redis.exists(emailKey);
            return exists === 1;
        } catch (error) {
            console.error(`❌ Error checking email existence for ${email}:`, error);
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
