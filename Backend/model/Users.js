const mongoose = require("mongoose");

const userSchema = new mongoose.Schema ( {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    confirmPassword: String
} )

module.exports = mongoose.model ("users", userSchema);