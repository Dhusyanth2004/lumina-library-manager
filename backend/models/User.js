const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['ADMIN', 'LIBRARIAN', 'STUDENT'],
        default: 'STUDENT'
    }
}, { timestamps: true });

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password; // Don't return password
    }
});

module.exports = mongoose.model('User', userSchema);
