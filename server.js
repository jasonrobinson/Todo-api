var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());  // can then access using req.body

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

// GET /todos
app.get('/todos', middleware.requireAuthentication, function (req, res) {
    var query = req.query;
    var where = {
        userId: req.user.get('id')
    };

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }
    db.todo.findAll({
        where: where
    }).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });

    // var queryParams = req.query;  // e.g. /todos?completed=true
    // // note: will receive "true" or "false" as a string, ~bool
    // var filteredTodos = todos;
    // var body = _.pick(req.body, 'description', 'completed');
    // if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    //     filteredTodos = _.where(filteredTodos, {completed: true});
    // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    //     filteredTodos = _.where(filteredTodos, {completed: false})
    // }

    // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    //     filteredTodos = _.filter(filteredTodos, function (todo) {
    //         return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) >= 0;
    //     });
    // }

    // res.json(filteredTodos);  // don't need to use JSON.stringify...
})

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    // db.todo.findById(todoId).then(function (todo) {
    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }}).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function (e) {
        res.status(500).send();
    })
    // var todoId = parseInt(req.params.id, 10);
    // var matchedTodo = _.findWhere(todos, {id: todoId});

    // if (matchedTodo) {
    //     res.json(matchedTodo);
    // } else {
    //     res.status(404).send();
    // }
});

app.post('/todos', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    // update for sequelize
    db.todo.create(body).then(function (todo) {
        // res.json(todo.toJSON());
        req.user.addTodo(todo).then(function () { // in middleware.js, had added req.user
            return todo.reload();
        }).then(function (todo) {
            res.json(todo.toJSON());
        });
    }, function (e) {
        return res.status(400).json(e);
    // }).catch(function (e) {
    //     console.log(e);
    });

    // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    //     return res.status(400).send();
    // }

    // body.description = body.description.trim();

    // body.id = todoNextId++;

    // todos.push(body);

    // // console.log('description: ' + body.description);

    // res.json(body);
});

app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    // db.todo.findById(todoId).then(function(todo) {
    //     if (!!todo) {
    //         res.json(todo);
    //         todo.destroy();
    //     } else {
    //         res.status(404).send();
    //     }
    // }, function (e) {
    //     res.status(500).send();
    // });
    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'No todo with id'
            });
        } else {
            res.status(204).send();  // OK and no response to send
        }
    });

    // var matchedTodo = _.findWhere(todos, {id: todoId});

    // if (!matchedTodo) {
    //     res.status(404).json({"error": "no todo found with that id"});
    // } else {
    //     todos = _.without(todos, matchedTodo);
    //     res.json(matchedTodo);
    //     // res.status(200).send();
    // }

});

app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    // var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};
    // var validAttributes = {};

    // if (!matchedTodo) {
    //     return res.status(404).send();
    // }

    if (body.hasOwnProperty('completed')) { // && _.isBoolean(body.completed)) {
        attributes.completed = body.completed;
        // validAttributes.completed = body.completed;
    } // else if (body.hasOwnProperty('completed')) {
    //     return res.status(400).send();
    // }

    if (body.hasOwnProperty('description')) { // && _.isString(body.description) && body.description.trim().length > 0) {
        attributes.description = body.description;
        // validAttributes.description = body.description;
    } // else if (body.hasOwnProperty('description')) {
    //     return res.status(400).send();
    // }

    // _.extend(matchedTodo, attributes);  // validAttributes);  // passed by reference, so modified
    // res.json(matchedTodo);

    // db.todo.findById(todoId).then(function (todo) {
    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        // if (todo) {
        //     return todo.update(attributes);
        // } else {
        //     res.status(404).send();
        // }
        if (todo) {
            return todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    // }).then(function (todo) {
    //     res.json(todo.toJSON());
    // }, function (e) {
    //     res.status(400).json(e);
    });

});

app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function (user) {
        res.json(user.toPublicJSON());  // this toPublicJSON instance method is defined in user.js
    }, function (e) {
        res.status(400).json(e);
    });
});

// route; users resource, login action
app.post('/users/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken('authentication');
        userInstance = user;

        return db.token.create({
            token: token
        });

        // if (token) {
        //     res.header('Auth', token).json(user.toPublicJSON());
        // } else {
        //     res.status(401).send();  // don't give good descriptions for login!
        // }
    }).then(function (tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function () {
        res.status(401).send();  // don't give good descriptions for login!
    });

    // if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    //     res.status(400).send();
    // }

    // // findById, findAll, findOne

    // db.user.findOne({
    //     where: {
    //         email: body.email
    //     }
    // }).then(function (user) {
    //     if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
    //         return res.status(401).send();  // 401: authentication possible, but it failed
    //     }
        
    //     res.json(user.toPublicJSON());
    // }, function (e) {
    //     res.status(500).send();
    // });
});

app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
    req.token.destroy().then(function () {
        res.status(204).send();
    }).catch(function () {
        res.status(500).send();
    });
})

// db.sequelize.sync().then(function () {
db.sequelize.sync({
    force: true
}).then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});

// app.listen(PORT, function () {
//     console.log('Express listening on port ' + PORT + '!');
// });


