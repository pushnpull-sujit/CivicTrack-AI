const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const aiService = require('../services/ai.service');
const notificationService = require('../services/notification.service');

// Helper to format currency
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const complaintController = {
  // AI Preview before submission
  async previewAIAnalysis(req, res) {
    try {
      const { description, latitude, longitude } = req.body;
      const file = req.file;

      if (!file && !description) {
        return res.status(400).json({ message: 'Please provide an image or description for AI analysis.' });
      }

      const filename = file ? file.originalname : '';
      const latNum = latitude ? parseFloat(latitude) : null;
      const lngNum = longitude ? parseFloat(longitude) : null;

      const analysis = await aiService.analyzeComplaint(description, filename, latNum, lngNum);
      
      res.json(analysis);
    } catch (error) {
      console.error('AI Preview error:', error);
      res.status(500).json({ message: 'Error running AI analysis.' });
    }
  },

  // Create Complaint (Citizen)
  async createComplaint(req, res) {
    try {
      const { title, description, latitude, longitude, categoryOverride } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Image upload is required to report an issue.' });
      }

      const latNum = latitude ? parseFloat(latitude) : null;
      const lngNum = longitude ? parseFloat(longitude) : null;

      // Run AI analysis
      const aiAnalysis = await aiService.analyzeComplaint(description, file.originalname, latNum, lngNum);

      // Save upload relative URL
      const imageUrlBefore = `/uploads/${file.filename}`;

      const complaintId = 'CMP-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      const newComplaint = {
        _id: complaintId,
        title: title || `${aiAnalysis.category} reported at Location`,
        description: description || '',
        category: categoryOverride || aiAnalysis.category,
        latitude: latNum,
        longitude: lngNum,
        imageUrlBefore,
        imageUrlAfter: null,
        status: 'Pending',
        severity: aiAnalysis.severity,
        priority: aiAnalysis.priority,
        isDuplicate: aiAnalysis.isDuplicate,
        duplicateOf: aiAnalysis.duplicateOf,
        detectedFeatures: aiAnalysis.detectedFeatures,
        confidence: aiAnalysis.confidence,
        citizenId: req.user.id,
        citizenName: req.user.name,
        citizenEmail: req.user.email,
        assignedStaffId: null,
        assignedStaffName: null,
        repairNotes: null,
        repairCost: null,
        completionDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.complaints.insert(newComplaint);

      // Send Email to Citizen
      await notificationService.sendEmail(
        req.user.email,
        `CivicTrack AI - Complaint Registered [${complaintId}]`,
        `Hello ${req.user.name},\n\nYour complaint regarding "${newComplaint.category}" has been registered successfully. Ticket ID: ${complaintId}.\n\nAI Diagnostic Details:\n- Detected Category: ${newComplaint.category}\n- Severity Level: ${newComplaint.severity}\n- Calculated Priority: ${newComplaint.priority}\n\nYou can track its live status on your Citizen Portal.`,
        `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 4px;">CivicTrack AI</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Smart Infrastructure Portal</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Hello <strong>${req.user.name}</strong>,</p>
          <p>Your civic complaint has been registered. Our AI model has analyzed your report and classified it:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Ticket ID</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${complaintId}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Category</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${newComplaint.category} (Confidence: ${(newComplaint.confidence * 100).toFixed(0)}%)</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Severity</td><td style="padding: 8px; border: 1px solid #cbd5e1; color: ${newComplaint.severity === 'High' ? '#dc2626' : '#d97706'}">${newComplaint.severity}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Priority</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: ${newComplaint.priority === 'Critical' ? '#dc2626' : '#2563eb'}">${newComplaint.priority}</td></tr>
          </table>
          <p>We have dispatched this ticket to the municipality administration dashboard. You will receive updates in real time as workers are assigned and repairs are executed.</p>
          <a href="#" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Track Live Status</a>
         </div>`
      );

      // Create in-app notification for Citizen
      await notificationService.createNotification(
        req.user.id,
        'Complaint Submitted',
        `Your complaint ${complaintId} (${newComplaint.category}) has been submitted and is pending verification.`,
        'status_update'
      );

      // Broadcast new complaint creation to any connected admins
      notificationService.broadcast('complaint_created', newComplaint);

      res.status(201).json(newComplaint);
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get Complaints (Filtered based on Role)
  async getComplaints(req, res) {
    try {
      const { status, category, priority } = req.query;
      const filter = {};

      // Role filter
      if (req.user.role === 'citizen') {
        filter.citizenId = req.user.id;
      } else if (req.user.role === 'staff') {
        filter.assignedStaffId = req.user.id;
      }

      // Query filters
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;

      const complaints = await db.complaints.find(filter);
      
      // Sort by newest first
      complaints.sort((a, b) => b.createdAt - a.createdAt);

      res.json(complaints);
    } catch (error) {
      console.error('Get complaints error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get single complaint details
  async getComplaintById(req, res) {
    try {
      const complaint = await db.complaints.findOne({ _id: req.params.id });
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found.' });
      }

      // Security check: citizens should only see their own
      if (req.user.role === 'citizen' && complaint.citizenId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      // Security check: staff should only see assigned
      if (req.user.role === 'staff' && complaint.assignedStaffId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      res.json(complaint);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Assign Complaint to Staff (Admin)
  async assignComplaint(req, res) {
    try {
      const { assignedStaffId } = req.body;
      const complaintId = req.params.id;

      if (!assignedStaffId) {
        return res.status(400).json({ message: 'Staff ID is required for assignment.' });
      }

      const staff = await db.users.findOne({ _id: assignedStaffId, role: 'staff' });
      if (!staff) {
        return res.status(400).json({ message: 'Invalid staff assignment. User must be a staff member.' });
      }

      const complaint = await db.complaints.findOne({ _id: complaintId });
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found.' });
      }

      // Update complaint details
      const updateData = {
        assignedStaffId: staff._id,
        assignedStaffName: staff.name,
        status: complaint.status === 'Pending' ? 'Verified' : complaint.status,
        updatedAt: new Date()
      };

      await db.complaints.update({ _id: complaintId }, { $set: updateData });
      const updatedComplaint = { ...complaint, ...updateData };

      // Send Email to Staff member
      await notificationService.sendEmail(
        staff.email,
        `CivicTrack AI - New Task Assigned [${complaintId}]`,
        `Hello ${staff.name},\n\nYou have been assigned to resolve a task: ${complaint.category} (Priority: ${complaint.priority}).\nDescription: ${complaint.description}\n\nPlease check your Staff Dashboard for details.`,
        `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 4px;">CivicTrack AI</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Task Assignment Notification</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Hello <strong>${staff.name}</strong>,</p>
          <p>You have been assigned to resolve the following infrastructure issue:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Ticket ID</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${complaintId}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Category</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${complaint.category}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Priority</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: ${complaint.priority === 'Critical' ? '#dc2626' : '#2563eb'}">${complaint.priority}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Description</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${complaint.description}</td></tr>
          </table>
          <p>Please log in to your Staff Dashboard, navigate to this ticket, and update your progress as work begins.</p>
         </div>`
      );

      // Notification to Staff
      await notificationService.createNotification(
        staff._id,
        'New Task Assigned',
        `You have been assigned ticket ${complaintId} (${complaint.category}).`,
        'assignment'
      );

      // Notification to Citizen (that their ticket is verified/assigned)
      await notificationService.createNotification(
        complaint.citizenId,
        'Staff Dispatched',
        `Staff member ${staff.name} has been assigned to resolve your ticket ${complaintId}.`,
        'status_update'
      );

      // Send Email to Citizen
      await notificationService.sendEmail(
        complaint.citizenEmail,
        `CivicTrack AI - Staff Dispatched [${complaintId}]`,
        `Hello ${complaint.citizenName},\n\nWe have dispatched staff member ${staff.name} to investigate and resolve your ticket ${complaintId}. The ticket status is now: Verified.`,
        `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3>CivicTrack AI - Staff Assigned</h3>
          <p>Hello <strong>${complaint.citizenName}</strong>,</p>
          <p>We are pleased to inform you that a field specialist, <strong>${staff.name}</strong>, has been assigned to address your ticket <strong>${complaintId}</strong>.</p>
          <p>Current Status: <strong>Verified / Dispatched</strong></p>
         </div>`
      );

      // Broadcast changes to active client screens
      notificationService.broadcast('complaint_updated', updatedComplaint);

      res.json(updatedComplaint);
    } catch (error) {
      console.error('Assign complaint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update Status / Complete (Admin / Staff)
  async updateStatus(req, res) {
    try {
      const complaintId = req.params.id;
      const { status, repairNotes, repairCost, completionDate } = req.body;
      const file = req.file; // optional work completion photo

      const complaint = await db.complaints.findOne({ _id: complaintId });
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found.' });
      }

      // Security check: Staff can only update their own assigned complaints
      if (req.user.role === 'staff' && complaint.assignedStaffId !== req.user.id) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (status) updateData.status = status;
      if (repairNotes) updateData.repairNotes = repairNotes;
      if (repairCost) updateData.repairCost = parseFloat(repairCost);
      
      if (completionDate) {
        updateData.completionDate = new Date(completionDate);
      } else if (status === 'Completed') {
        updateData.completionDate = new Date();
      }

      if (file) {
        updateData.imageUrlAfter = `/uploads/${file.filename}`;
      }

      // Enforce data checks when marking completed
      if (status === 'Completed') {
        updateData.status = 'Completed';
      }

      await db.complaints.update({ _id: complaintId }, { $set: updateData });
      const updatedComplaint = { ...complaint, ...updateData };

      // Trigger Notifications on status updates
      if (status) {
        // Notify Citizen of status change
        await notificationService.createNotification(
          complaint.citizenId,
          'Status Update',
          `Your ticket ${complaintId} has been updated to: ${status}.`,
          'status_update'
        );

        if (status === 'Completed') {
          // Send completion email
          const formattedCost = formatCurrency(updateData.repairCost || 0);
          await notificationService.sendEmail(
            complaint.citizenEmail,
            `CivicTrack AI - Complaint Resolved! [${complaintId}]`,
            `Hello ${complaint.citizenName},\n\nWe are happy to report that your ticket ${complaintId} (${complaint.category}) has been resolved and repaired.\nRepair Cost: ${formattedCost}\nRepair Notes: ${updateData.repairNotes || 'Completed standard maintenance.'}`,
            `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #10b981;">Repair Completed!</h2>
              <p>Hello <strong>${complaint.citizenName}</strong>,</p>
              <p>Your ticket <strong>${complaintId}</strong> regarding <strong>${complaint.category}</strong> has been resolved and closed.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <h4>Work Record Details:</h4>
              <ul>
                <li><strong>Status:</strong> Completed</li>
                <li><strong>Resolution Cost:</strong> ${formattedCost}</li>
                <li><strong>Maintenance Notes:</strong> ${updateData.repairNotes || 'Completed standard maintenance.'}</li>
                <li><strong>Completion Date:</strong> ${updateData.completionDate.toLocaleDateString()}</li>
              </ul>
              <p>Thank you for using CivicTrack AI to make our city a better place!</p>
             </div>`
          );
        } else {
          // General status change email
          await notificationService.sendEmail(
            complaint.citizenEmail,
            `CivicTrack AI - Status Update [${complaintId}]`,
            `Hello ${complaint.citizenName},\n\nThe status of your complaint ${complaintId} has changed to: ${status}.`,
            `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3>CivicTrack AI - Status Update</h3>
              <p>Hello <strong>${complaint.citizenName}</strong>,</p>
              <p>The status of your ticket <strong>${complaintId}</strong> has been updated:</p>
              <p style="font-size: 18px;">New Status: <strong style="color: #2563eb;">${status}</strong></p>
             </div>`
          );
        }
      }

      // Broadcast changes to active client dashboards
      notificationService.broadcast('complaint_updated', updatedComplaint);

      res.json(updatedComplaint);
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = complaintController;
