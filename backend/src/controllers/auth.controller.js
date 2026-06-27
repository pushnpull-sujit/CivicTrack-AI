const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcivictrackaijwtkey123!';

const authController = {
  // Register Citizen / Admin / Staff
  async register(req, res) {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await db.users.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Enforce default citizen role if not specified
      const assignedRole = role || 'citizen';
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: Math.random().toString(36).substring(2, 15),
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: assignedRole,
        createdAt: new Date()
      };

      await db.users.insert(newUser);

      // Create JWT
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await db.users.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT
      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get current user profile from token
  async getMe(req, res) {
    try {
      const user = await db.users.findOne({ _id: req.user.id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture || null
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update user profile (Name, Email, Profile Picture)
  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }

      // Check if email is already taken by another user
      const existingUser = await db.users.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account.' });
      }

      const updates = {
        name,
        email: email.toLowerCase()
      };

      if (req.file) {
        updates.profilePicture = `/uploads/${req.file.filename}`;
      }

      await db.users.update({ _id: userId }, { $set: updates });
      const updatedUser = await db.users.findOne({ _id: userId });

      // Generate a updated JWT token so client session doesn't mismatch name/email
      const token = jwt.sign(
        { id: updatedUser._id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          profilePicture: updatedUser.profilePicture || null
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Change Password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required' });
      }

      const user = await db.users.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.users.update({ _id: userId }, { $set: { password: hashedPassword } });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete User Account
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      
      // Remove from database
      await db.users.remove({ _id: userId });
      
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // List all users with 'staff' role (used by admins to assign tasks)
  async getStaffList(req, res) {
    try {
      const staff = await db.users.find({ role: 'staff' }, { password: 0 });
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = authController;
