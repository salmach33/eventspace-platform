const mongoose = require('mongoose');
require('dotenv').config();

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'OK' : 'MANQUANT');
console.log('ADMIN_SECRET:', process.env.ADMIN_SECRET ? 'OK' : 'MANQUANT');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB OK');
  const User = require('./models/User');
  const Space = require('./models/Space');
  const users = await User.find({});
  const spaces = await Space.find({});
  console.log('Users:', users.length);
  users.forEach(u => console.log(' -', u.email, '| role:', u.role));
  console.log('Spaces:', spaces.length);
  spaces.forEach(s => console.log(' -', s.title, '| isValidated:', s.isValidated));
  process.exit(0);
}).catch(e => {
  console.log('ERREUR MongoDB:', e.message);
  process.exit(1);
});