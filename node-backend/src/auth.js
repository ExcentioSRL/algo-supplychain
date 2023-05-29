const authenticate = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'User isn\'t authenticated' });
    }
};

module.exports = {authenticate};