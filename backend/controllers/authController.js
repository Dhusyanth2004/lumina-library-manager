const authService = require('../services/authService');

exports.signup = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await authService.loginUser(req.body);
        res.json({ user });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};
