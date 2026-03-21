import mongoose from 'mongoose';
import Admin from '../models/Admin';
import { connectDatabase } from '../config/database';

async function seedAdmin() {
  try {
    await connectDatabase();

    const adminEmail = 'yasinkaracam67@gmail.com';
    const adminUsername = 'yasin';
    const adminPassword = 'Ya14sin123';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('✓ Admin already exists:', adminEmail);
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
    });

    console.log('✓ Admin created successfully:');
    console.log('  Username:', admin.username);
    console.log('  Email:', admin.email);
    console.log('  Password:', adminPassword);

    process.exit(0);
  } catch (error: any) {
    console.error('✗ Seed error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
