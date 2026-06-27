const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authController = require('../controllers/auth.controller');
const complaintController = require('../controllers/complaint.controller');
const analyticsController = require('../controllers/analytics.controller');
const notificationService = require('../services/notification.service');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, JPG, PNG, WEBP) are allowed!'));
  }
});

// --- AUTHENTICATION & PROFILE ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);
router.get('/auth/staff', authMiddleware, checkRole(['admin']), authController.getStaffList);
router.put('/auth/profile', authMiddleware, upload.single('profilePicture'), authController.updateProfile);
router.put('/auth/password', authMiddleware, authController.changePassword);
router.delete('/auth/account', authMiddleware, authController.deleteAccount);

// --- COMPLAINT ROUTES ---
router.post(
  '/complaints', 
  authMiddleware, 
  checkRole(['citizen']), 
  upload.single('image'), 
  complaintController.createComplaint
);

router.post(
  '/complaints/preview', 
  authMiddleware, 
  checkRole(['citizen']), 
  upload.single('image'), 
  complaintController.previewAIAnalysis
);

router.get('/complaints', authMiddleware, complaintController.getComplaints);
router.get('/complaints/:id', authMiddleware, complaintController.getComplaintById);

// Admin assignment
router.put(
  '/complaints/:id/assign', 
  authMiddleware, 
  checkRole(['admin']), 
  complaintController.assignComplaint
);

// Admin/Staff status/work completion update
router.put(
  '/complaints/:id/status', 
  authMiddleware, 
  checkRole(['admin', 'staff']), 
  upload.single('image'), // optional after-photo
  complaintController.updateStatus
);

// --- ANALYTICS ROUTES ---
router.get('/analytics/summary', authMiddleware, checkRole(['admin']), analyticsController.getSummary);

// --- REAL-TIME SSE (Server-Sent Events) ---
router.get('/notifications/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.write('retry: 10000\n\n');
  
  // Register SSE connection
  notificationService.addClient(res);

  req.on('close', () => {
    notificationService.removeClient(res);
  });
});

// --- DEBUG MAIL EXPLORER (For testing/verification) ---
router.get('/debug/emails', authMiddleware, checkRole(['admin']), (req, res) => {
  res.json(notificationService.getSentEmails());
});

module.exports = router;
