const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('./models/User');
const connectDB = require('./config/db');

async function migrate() {
    await connectDB();
    console.log('Migrating usernames to lowercase...');

    const users = await User.find({});
    for (const user of users) {
        if (user.username !== user.username.toLowerCase()) {
            console.log(`Updating ${user.username} -> ${user.username.toLowerCase()}`);
            user.username = user.username.toLowerCase();
            await user.save();
        }
    }

    console.log('Migration complete.');
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
