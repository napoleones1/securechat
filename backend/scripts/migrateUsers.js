require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Find all users without 'name' field or with old username format
    const users = await User.find({});
    
    console.log(`Found ${users.length} users to check`);
    
    let updated = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // If user doesn't have 'name' field, use username as name
      if (!user.name) {
        updates.name = user.username || 'User';
        needsUpdate = true;
      }
      
      // If username doesn't start with @, add it
      if (user.username && !user.username.startsWith('@')) {
        // Remove spaces and convert to lowercase
        const cleanUsername = user.username.toLowerCase().replace(/\s+/g, '');
        updates.username = `@${cleanUsername}`;
        needsUpdate = true;
      } else if (user.username && user.username.includes(' ')) {
        // If username has spaces, remove them
        updates.username = user.username.toLowerCase().replace(/\s+/g, '');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updates);
        console.log(`✅ Updated user: ${user.email}`);
        console.log(`   Name: ${updates.name || user.name}`);
        console.log(`   Username: ${updates.username || user.username}`);
        updated++;
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Migration complete!`);
    console.log(`   Total users: ${users.length}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${users.length - updated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating users:', error.message);
    process.exit(1);
  }
};

migrateUsers();
