const mongoose = require('mongoose');

const uri = "mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const targetEmails = [
  'test_c@example.com',
  'test_p@example.com',
  'test_g@example.com',
  'user@youniqle.com',
  'user@test.com',
  'coach@test.com',
  'admin@test.com',
  'coach-test@youniqle.com',
  'test-medical@youniqle.com',
  'test-commerce@youniqle.com',
  'test-trainer@youniqle.com',
  'testuser_fl@example.com',
  'test_user_live@youniqle.com',
  'testuser_fl_3@example.com'
];

async function purgeDatabase(dbName) {
  console.log(`\n=================== PURGING DATABASE: ${dbName} ===================`);
  
  // Connect to the specific database
  const dbUri = `mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
  const conn = await mongoose.createConnection(dbUri).asPromise();
  
  try {
    const db = conn.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Find matched users from "users" collection first
    let userIds = [];
    let matchedUserEmailsFound = [];
    
    if (collectionNames.includes('users')) {
      const usersCol = db.collection('users');
      
      // Build search query for exact emails or soft-deleted ones (e.g., deleted_123456_email)
      const userConditions = targetEmails.flatMap(email => [
        { email: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') },
        { email: new RegExp('deleted_.*' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
      ]);
      
      const foundUsers = await usersCol.find({ $or: userConditions }).toArray();
      
      console.log(`Found ${foundUsers.length} users in 'users' collection:`);
      foundUsers.forEach(u => {
        console.log(` - Email: ${u.email}, ID: ${u._id}, Name: ${u.name}, Role: ${u.role}`);
        userIds.push(u._id);
        matchedUserEmailsFound.push(u.email);
      });
    }

    if (userIds.length === 0) {
      console.log("No users matching the criteria found in 'users' collection.");
    }
    
    // Also build a regex list for search in other collections that store emails
    const emailRegexList = targetEmails.flatMap(email => [
      new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'),
      new RegExp('deleted_.*' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
    ]);

    // Now, go through all collections and delete references
    for (const colName of collectionNames) {
      const col = db.collection(colName);
      let query = {};
      
      // Build queries based on the collection's fields
      const orConditions = [];
      
      if (userIds.length > 0) {
        // userId field (as ObjectId or String)
        orConditions.push({ userId: { $in: userIds } });
        orConditions.push({ userId: { $in: userIds.map(id => id.toString()) } });
        orConditions.push({ memberId: { $in: userIds } });
        orConditions.push({ memberId: { $in: userIds.map(id => id.toString()) } });
        orConditions.push({ navigatorId: { $in: userIds } });
        orConditions.push({ coachId: { $in: userIds } });
        orConditions.push({ playerId: { $in: userIds } });
        orConditions.push({ playerId: { $in: userIds.map(id => id.toString()) } });
      }
      
      // email or userEmail field
      orConditions.push({ email: { $in: emailRegexList } });
      orConditions.push({ userEmail: { $in: emailRegexList } });
      
      // Special check for _id matching any found userIds
      if (colName === 'users' && userIds.length > 0) {
        orConditions.push({ _id: { $in: userIds } });
      }

      if (orConditions.length > 0) {
        query = { $or: orConditions };
        
        // Find matching documents before deleting to log them
        const countBefore = await col.countDocuments(query);
        if (countBefore > 0) {
          console.log(`Deleting ${countBefore} documents from collection '${colName}'...`);
          const deleteResult = await col.deleteMany(query);
          console.log(`Successfully deleted ${deleteResult.deletedCount} documents from '${colName}'.`);
        }
      }
    }
    
    console.log(`Purge of database ${dbName} complete.`);
  } catch (err) {
    console.error(`Error purging database ${dbName}:`, err);
  } finally {
    await conn.close();
    console.log(`Disconnected from ${dbName}.`);
  }
}

async function main() {
  try {
    // Purge both active databases
    await purgeDatabase('youniqle');
    await purgeDatabase('test');
    console.log("\n=================== GLOBAL PURGE PROCESS FINISHED ===================");
  } catch (error) {
    console.error("Global process error:", error);
  }
}

main();
