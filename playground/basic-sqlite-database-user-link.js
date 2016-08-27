var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database-user-link.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

// 1 User: Many Todos

var User = sequelize.define('user', {
    email: Sequelize.STRING
    // email: {
    //     type: Sequelize.STRING
    // }
});

// create Foreign Keys
// here is 1:Many, but sequelize had others

Todo.belongsTo(User);
User.hasMany(Todo);

// this sets up userId in todos 

sequelize.sync({
    // force: true
}).then(function () {
    console.log('Everything is synced');

    // sequelize adds getTodos

    User.findById(1).then(function (user) {
        user.getTodos({
            where: {
                completed: false
            }
        }).then(function (todos) {
            todos.forEach(function (todo) {
                console.log(todo.toJSON());
            });
        });
    });

    // User.create({
    //     email: 'andrew@example.com'
    // }).then(function () {
    //     return Todo.create({
    //         description: 'Clean yard'
    //     });
    // }).then(function (todo) {
    //     User.findById(1).then(function (user) {
    //         user.addTodo(todo);
    //     });
    // });
});

