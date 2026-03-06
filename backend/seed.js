/**
 * Seed Script - Creates demo admin user and basic data
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Department = require('./models/Department');
const { DEPARTMENTS } = require('./utils/constants');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user if doesn't exist
    console.log('👤 Creating admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@govintel.gov.in' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
    } else {
      await User.create({
        name: 'Admin User',
        email: 'admin@govintel.gov.in',
        password: 'admin123',
        role: 'admin',
        department: 'Ministry of Finance'
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@govintel.gov.in');
      console.log('   Password: admin123');
    }

    // Create basic departments if needed
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log('🏢 Creating departments...');
      for (let i = 0; i < DEPARTMENTS.length; i++) {
        await Department.create({
          name: DEPARTMENTS[i],
          code: `DEPT-${String(i + 1).padStart(3, '0')}`,
          ministry: 'Ministry of Finance',
          description: `${DEPARTMENTS[i]} department`,
          isActive: true
        });
      }
      console.log(`✅ Created ${DEPARTMENTS.length} departments`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nYou can now login with:');
    console.log('  Email: admin@govintel.gov.in');
    console.log('  Password: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
