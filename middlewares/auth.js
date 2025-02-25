module.exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) return res.redirect("/login");
    next();
};


module.exports.isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        console.log(req.session.user)
        return res.status(403).send("Access Denied: Admins Only");
    }
    next();
};