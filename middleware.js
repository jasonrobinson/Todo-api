// middleware runs before a regular route handler executes

module.exports = function (db) {

    return {
        requireAuthentication: function (req, res, next) {  // control access to private via next
            var token = req.get('Auth');  // token from header

            db.user.findByToken(token).then(function (user) {
                req.user = user;
                next();
            }, function () {
                res.status(401).send();
            });
        }
    };

};