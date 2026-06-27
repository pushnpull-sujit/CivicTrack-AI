const path = require('path');
const Datastore = require('nedb-promises');

// Create local file database paths
const dbDir = path.join(__dirname, '../../data');

const db = {
  users: Datastore.create({ filename: path.join(dbDir, 'users.db'), autoload: true }),
  complaints: Datastore.create({ filename: path.join(dbDir, 'complaints.db'), autoload: true }),
  notifications: Datastore.create({ filename: path.join(dbDir, 'notifications.db'), autoload: true })
};

console.log('Database initialized with local files at:', dbDir);

module.exports = db;
