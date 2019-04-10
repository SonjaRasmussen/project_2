var db = require("../models");

module.exports = function(app) {
  app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
      db.User.findByPk(req.user.uuid).then(function(dbUser) {
        dbUser.getToDos().then(function(dbToDo) {
          console.log("dbToDo", dbToDo);

          var hbsObj = {
            todos: [],
            completed: [],
            user: req.user,
            id: req.session.passport.user,
            isloggedin: req.isAuthenticated()
          };
          dbToDo.forEach(function(task) {
            if (task.completed) {
              hbsObj.completed.push(task.dataValues);
            } else {
              hbsObj.todos.push(task.dataValues);
            }
          });

          res.render("home", hbsObj); //if i make this createtasks, the items appear on the page but dashboard won't load
        });
      });
    } else {
      res.redirect("/login");
    }
  });
  //mark a task complete
  app.post("/task-complete/:id", function(req, res) {
    if (req.isAuthenticated()) {
      db.ToDo.findByPk(req.params.id)
        .then(function(dbTodo) {
          dbTodo.completed = true;
          dbTodo.save();
        })
        .then(function() {
          res.redirect("/");
        });
    }
  });
  //mark a task complete
  app.post("/task-undo/:id", function(req, res) {
    if (req.isAuthenticated()) {
      db.ToDo.findByPk(req.params.id)
        .then(function(dbTodo) {
          dbTodo.completed = false;
          dbTodo.save();
        })
        .then(function() {
          res.redirect("/");
        });
    }
  });
  //Add a task
  app.post("/task", function(req, res) {
    if (req.isAuthenticated()) {
      console.log("Creating todo");
      db.ToDo.create({
        task: req.body.task_name,
        completed: false,
        ownerUuid: req.user.uuid
      }).then(function(dbTodo) {
        // res.redirect("/"); /* blocked out to prevent adding task to direct to dashboard*/
      });
    } else {
      res.redirect("/login");
    }
  });

  //Delete a Task
  app.post("/task-delete/:id", function(req, res) {
    if (req.isAuthenticated()) {
      console.log("Deleting a task");
      db.ToDo.destroy({
        where: {
          id: req.params.id
        }
      }).then(function(dbTodo) {
        res.redirect("/");
      });
    } else {
      res.redirect("/login");
    }
  });
};
