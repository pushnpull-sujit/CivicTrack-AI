const db = require('../config/db');

// In-memory array to log emails for local debugging
const sentEmails = [];
// Active SSE client connections
let sseClients = [];

const notificationService = {
  // Register SSE Client
  addClient(res) {
    sseClients.push(res);
    console.log(`SSE Client connected. Total: ${sseClients.length}`);
  },

  removeClient(res) {
    sseClients = sseClients.filter(client => client !== res);
    console.log(`SSE Client disconnected. Total: ${sseClients.length}`);
  },

  // Broadcast real-time SSE push update
  broadcast(type, data) {
    const payload = JSON.stringify({ type, data });
    sseClients.forEach(client => {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch (err) {
        console.error('Error writing to SSE client:', err.message);
      }
    });
  },

  // Send Email Notification (Logged locally & Broadcasted)
  async sendEmail(to, subject, text, html) {
    const emailRecord = {
      id: Math.random().toString(36).substring(2, 9),
      to,
      subject,
      text,
      html,
      sentAt: new Date()
    };
    sentEmails.push(emailRecord);
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    
    // Broadcast email event for frontend debug logger
    this.broadcast('email_debug', emailRecord);
    
    return emailRecord;
  },

  // Create In-App Notification
  async createNotification(userId, title, message, type = 'general') {
    const notification = {
      _id: Math.random().toString(36).substring(2, 15),
      userId,
      title,
      message,
      read: false,
      type,
      createdAt: new Date()
    };

    await db.notifications.insert(notification);
    
    // Broadcast real-time notifications to users
    this.broadcast('notification', notification);
    
    return notification;
  },

  // Retrieve Sent Emails
  getSentEmails() {
    return sentEmails;
  }
};

module.exports = notificationService;
