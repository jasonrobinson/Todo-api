// middleware runs before a regular route handler executes

var cryptojs = require('crypto-js');

module.exports = function (db) {

    return {
        requireAuthentication: function (req, res, next) {  // control access to private via next
            var token = req.get('Auth') || '';  // token from header

            db.token.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then(function (tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }

                req.token = tokenInstance;
                return db.user.findByToken(token);  // return keeps promise chain working
            }).then(function (user) {
                req.user = user;
                next();
            }).catch(function () {
                res.status(401).send();
            });

            // db.user.findByToken(token).then(function (user) {
            //     req.user = user;
            //     next();
            // }, function () {
            //     res.status(401).send();
            // });
        }
    };

};