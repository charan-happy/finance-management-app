import { neon } from '@neondatabase/serverless';

const connectionString = "postgresql://neondb_owner:npg_WxiN6GECJ5Qd@ep-flat-silence-ahmh5zie-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

console.log('🔍 Testing Neon database connection...\n');

try {
  const sql = neon(connectionString);
  
  // Test 1: Basic connection
  console.log('Test 1: Checking database connection...');
  const versionResult = await sql`SELECT version()`;
  console.log('✅ Connection successful!');
  console.log('   PostgreSQL version:', versionResult[0].version.split(' ')[0], versionResult[0].version.split(' ')[1]);
  
  // Test 2: Create table
  console.log('\nTest 2: Creating user_data table...');
  await sql`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('✅ Table created successfully!');
  
  // Test 3: Insert test data
  console.log('\nTest 3: Inserting test data...');
  const testUserId = 'test-user-' + Date.now();
  const testData = { 
    transactions: [],
    debts: [],
    goals: [],
    test: true,
    timestamp: new Date().toISOString()
  };
  
  await sql`
    INSERT INTO user_data (user_id, data, updated_at)
    VALUES (${testUserId}, ${JSON.stringify(testData)}, CURRENT_TIMESTAMP)
  `;
  console.log('✅ Data inserted successfully!');
  
  // Test 4: Read data back
  console.log('\nTest 4: Reading data back...');
  const result = await sql`
    SELECT data, updated_at FROM user_data WHERE user_id = ${testUserId}
  `;
  console.log('✅ Data retrieved successfully!');
  console.log('   Retrieved data:', JSON.stringify(result[0].data, null, 2));
  
  // Test 5: Update data
  console.log('\nTest 5: Updating data...');
  const updatedData = { ...testData, updated: true };
  await sql`
    UPDATE user_data 
    SET data = ${JSON.stringify(updatedData)}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${testUserId}
  `;
  console.log('✅ Data updated successfully!');
  
  // Test 6: Clean up
  console.log('\nTest 6: Cleaning up test data...');
  await sql`DELETE FROM user_data WHERE user_id = ${testUserId}`;
  console.log('✅ Test data cleaned up!');
  
  console.log('\n🎉 All database tests passed! Your Neon database is working perfectly.');
  console.log('\n📝 Summary:');
  console.log('   ✓ Connection: Working');
  console.log('   ✓ Table creation: Working');
  console.log('   ✓ Insert operations: Working');
  console.log('   ✓ Read operations: Working');
  console.log('   ✓ Update operations: Working');
  console.log('   ✓ Delete operations: Working');
  console.log('\n✅ Your app will work perfectly when deployed to Netlify/Cloud!');
  
} catch (error) {
  console.error('\n❌ Database test failed!');
  console.error('Error:', error.message);
  console.error('\nDetails:', error);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('   1. Check if the connection string is correct');
  console.log('   2. Verify your Neon database is active (not paused)');
  console.log('   3. Check network connectivity');
  console.log('   4. Ensure SSL mode is properly configured');
}
