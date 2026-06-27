const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const db = require('./src/config/db');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api', apiRoutes);

// Base health route
app.get('/', (req, res) => {
  res.json({ message: 'CivicTrack AI API is active.' });
});

// Create default placeholder images for seeded complaints if they don't exist
function createSeedImages() {
  const uploadDir = path.join(__dirname, 'public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create a minimal transparent PNG file for mock storage if they don't exist
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const buffer = Buffer.from(base64Png, 'base64');

  const files = ['seed-pothole.png', 'seed-light.png', 'seed-garbage.png', 'seed-water.png', 'seed-repaired.png'];
  files.forEach(file => {
    const filePath = path.join(uploadDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, buffer);
    }
  });
}

// Seed Database Function
async function seedDatabase() {
  try {
    createSeedImages();

    const userCount = await db.users.count({});
    if (userCount === 0) {
      console.log('Seeding default system users...');
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('password123', salt);

      const citizen = {
        _id: 'usr-citizen',
        email: 'citizen@civictrack.ai',
        password: hashedPassword,
        name: 'Sarah Citizen',
        role: 'citizen',
        createdAt: new Date()
      };

      const admin = {
        _id: 'usr-admin',
        email: 'admin@civictrack.ai',
        password: hashedPassword,
        name: 'Chief Admin Commissioner',
        role: 'admin',
        createdAt: new Date()
      };

      const staff1 = {
        _id: 'usr-staff1',
        email: 'staff@civictrack.ai',
        password: hashedPassword,
        name: 'Marcus Specialist (Roads)',
        role: 'staff',
        createdAt: new Date()
      };

      const staff2 = {
        _id: 'usr-staff2',
        email: 'electrician@civictrack.ai',
        password: hashedPassword,
        name: 'Elena Electra (Utilities)',
        role: 'staff',
        createdAt: new Date()
      };

      await db.users.insert([citizen, admin, staff1, staff2]);
      console.log('User seeding completed successfully!');
    }

    const complaintCount = await db.complaints.count({});
    if (complaintCount === 0) {
      console.log('Seeding initial infrastructure complaints for analytics visual richness...');
      
      const seedDatePast = (days) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
      };

      const seededComplaints = [
        {
          _id: 'CMP-8263A',
          title: 'Deep pothole blocking main lane',
          description: 'A massive pothole has opened up in the middle lane. It is causing cars to swerve dangerously into oncoming traffic.',
          category: 'Pothole',
          latitude: 37.7749, // Center in San Francisco
          longitude: -122.4194,
          imageUrlBefore: '/uploads/seed-pothole.png',
          imageUrlAfter: '/uploads/seed-repaired.png',
          status: 'Completed',
          severity: 'High',
          priority: 'Critical',
          isDuplicate: false,
          duplicateOf: null,
          detectedFeatures: ['asphalt cavitation', 'exposed rebar hazard', 'structural fatigue'],
          confidence: 0.94,
          citizenId: 'usr-citizen',
          citizenName: 'Sarah Citizen',
          citizenEmail: 'citizen@civictrack.ai',
          assignedStaffId: 'usr-staff1',
          assignedStaffName: 'Marcus Specialist (Roads)',
          repairNotes: 'Pothole cleaned, filled with hot asphalt mix, and compacted. Surface leveled matching traffic lane guidelines.',
          repairCost: 450.00,
          createdAt: seedDatePast(12),
          completionDate: seedDatePast(10),
          updatedAt: seedDatePast(10)
        },
        {
          _id: 'CMP-9182B',
          title: 'Three streetlights out on park boulevard',
          description: 'The entire stretch of streetlights near the playground is completely dark. Creates a safety concern at night.',
          category: 'Broken Streetlight',
          latitude: 37.7833,
          longitude: -122.4167,
          imageUrlBefore: '/uploads/seed-light.png',
          imageUrlAfter: null,
          status: 'In Progress',
          severity: 'Medium',
          priority: 'Medium',
          isDuplicate: false,
          duplicateOf: null,
          detectedFeatures: ['luminaire outage', 'circuit fault risk'],
          confidence: 0.89,
          citizenId: 'usr-citizen',
          citizenName: 'Sarah Citizen',
          citizenEmail: 'citizen@civictrack.ai',
          assignedStaffId: 'usr-staff2',
          assignedStaffName: 'Elena Electra (Utilities)',
          repairNotes: null,
          repairCost: null,
          createdAt: seedDatePast(4),
          completionDate: null,
          updatedAt: seedDatePast(2)
        },
        {
          _id: 'CMP-2394C',
          title: 'Major water leakage from sidewalk main',
          description: 'Clean water has been gushing out of the sidewalk pavement since this morning. Substantial water accumulation on street.',
          category: 'Water Leakage',
          latitude: 37.7699,
          longitude: -122.4468,
          imageUrlBefore: '/uploads/seed-water.png',
          imageUrlAfter: null,
          status: 'Verified',
          severity: 'High',
          priority: 'High',
          isDuplicate: false,
          duplicateOf: null,
          detectedFeatures: ['water main fracture', 'pressure pooling'],
          confidence: 0.92,
          citizenId: 'usr-citizen',
          citizenName: 'Sarah Citizen',
          citizenEmail: 'citizen@civictrack.ai',
          assignedStaffId: null,
          assignedStaffName: null,
          repairNotes: null,
          repairCost: null,
          createdAt: seedDatePast(2),
          completionDate: null,
          updatedAt: seedDatePast(2)
        },
        {
          _id: 'CMP-4451D',
          title: 'Illegal dump site on corner alleyway',
          description: 'A heap of construction trash, old furniture, and garbage bags have been dumped. Attracting flies and blocking walking path.',
          category: 'Garbage',
          latitude: 37.7946,
          longitude: -122.4074,
          imageUrlBefore: '/uploads/seed-garbage.png',
          imageUrlAfter: null,
          status: 'Pending',
          severity: 'Medium',
          priority: 'Medium',
          isDuplicate: false,
          duplicateOf: null,
          detectedFeatures: ['illegal solid waste accumulation', 'passage blockage'],
          confidence: 0.87,
          citizenId: 'usr-citizen',
          citizenName: 'Sarah Citizen',
          citizenEmail: 'citizen@civictrack.ai',
          assignedStaffId: null,
          assignedStaffName: null,
          repairNotes: null,
          repairCost: null,
          createdAt: seedDatePast(1),
          completionDate: null,
          updatedAt: seedDatePast(1)
        }
      ];

      await db.complaints.insert(seededComplaints);
      console.log('Seeded initial complaints successfully!');
    }
  } catch (err) {
    console.error('Database seeding error:', err);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(` CivicTrack AI Server running on port ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================`);
  await seedDatabase();
});
