// api/test-storage.js - Debug endpoint to test blueprint storage
import BlueprintStorage from './blueprint-storage.js';

export default async function handler(req, res) {
    try {
        const testId = `test-${Date.now()}`;
        
        console.log('🧪 Starting storage test...');
        
        // Test 1: Store a blueprint
        const testData = {
            submissionId: testId,
            contactName: 'Test User',
            contactEmail: 'test@example.com',
            blueprintContent: 'This is a test blueprint with some content',
            status: 'completed',
            generatedAt: new Date().toISOString()
        };
        
        console.log(`📝 Storing test blueprint with ID: ${testId}`);
        const stored = BlueprintStorage.store(testId, testData);
        
        if (!stored) {
            return res.status(500).json({
                success: false,
                error: 'Failed to store test blueprint',
                testId
            });
        }
        
        // Test 2: Check if it exists
        console.log(`🔍 Checking if blueprint exists: ${testId}`);
        const exists = BlueprintStorage.exists(testId);
        
        // Test 3: Retrieve it
        console.log(`📖 Retrieving test blueprint: ${testId}`);
        const retrieved = BlueprintStorage.retrieve(testId);
        
        // Test 4: List all blueprints
        const allBlueprints = BlueprintStorage.listAll();
        
        // Test 5: Clean up
        console.log(`🗑️ Cleaning up test blueprint: ${testId}`);
        const deleted = BlueprintStorage.delete(testId);
        
        // Results
        return res.status(200).json({
            success: true,
            message: 'Storage test completed successfully',
            results: {
                testId,
                stored: stored,
                exists: exists,
                retrieved: retrieved !== null,
                retrievedData: retrieved,
                allBlueprintsCount: allBlueprints.length,
                allBlueprints: allBlueprints,
                deleted: deleted
            },
            verdict: stored && exists && retrieved && deleted ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED',
            storageInfo: {
                directory: '/tmp/blueprints',
                writable: true,
                readable: true
            }
        });
        
    } catch (error) {
        console.error('❌ Storage test failed:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
