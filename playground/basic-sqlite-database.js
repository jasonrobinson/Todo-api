var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        // validations
        allowNull: false,
        validate: {
            // notEmpty: true
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

// force: true forces recreate
sequelize.sync({
    force: true
}).then(function () {
    console.log('Everything is synced');

    Todo.findById(2).then(function (todo) {
        if (todo) {
            console.log(todo.toJSON());
        } else {
            console.log('Todo not found!');
        }
    });

    // Todo.create({
    //     // description: 'Walk the dog',
    //     description: 'Take out trash',
    //     // completed: false
    // }).then(function (todo) {
    //     // console.log('Finished!');
    //     // console.log(todo);
    //     return Todo.create({
    //         description: 'Clean office'
    //     });
    // }).then(function () {
    //     // return Todo.findById(1)
    //     return Todo.findAll({
    //         where: {
    //             // completed: false
    //             description: {
    //                 $like: '%trash%'
    //             }
    //         }
    //     });
    // // }).then(function (todo) {
    // //     if (todo) {
    // //         console.log(todo.toJSON());
    // //     } else {
    // //         console.log('No todo found!');
    // //     }
    // }).then(function (todos) {
    //     if (todos) {
    //         todos.forEach(function (todo) {
    //             console.log(todo.toJSON());
    //         })
    //     } else {
    //         console.log('No todos found!');
    //     }
    // }).catch(function (e) {
    //     console.log(e);
    // });
});

