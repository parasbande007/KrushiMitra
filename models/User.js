const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email', // Use 'email' as the username field
    usernameLowerCase: true, // Ensure email is stored in lowercase
  });
  
module.exports = mongoose.model('User', userSchema);
