const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

exports.registerUser = async (userData) => {
    const { username, email, password, role } = userData;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const newUser = new User({ username, email, password, role });
    await newUser.save();

    const token = generateToken(newUser);

    return {
        username: newUser.username,
        role: newUser.role,
        token
    };
};

exports.loginUser = async (credentials) => {
    const { username, password } = credentials;

    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user);

    return {
        username: user.username,
        role: user.role,
        token
    };
};
