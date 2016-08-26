module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                // can add additional requirements using regex from validate
                len: [7, 100]
            }
        }
    }, {
        hooks: {
            beforeValidate: function (user, options) {
                if (typeof user.email) {
                    user.email = user.email.toLowerCase();
                }
            }
        }
    });
};
