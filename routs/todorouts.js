const express = require('express');
const route= express.Router();

//import handler function from controller
const {addTodo,allTodos,specificTodoItem,updateTodoItem,deleteTodoItem,getTodosByStatus,uploadTodoFromCSV,downloadTodoListAsCSV} = require("../controller/todocontroller");

//mapping route with handler function
route.post("/todos",addTodo);
route.get("/todos",allTodos);
route.get("/todos/:id",specificTodoItem);
route.put("/todos/:id",updateTodoItem);
route.delete("/todos/:id",deleteTodoItem);
route.get("/odos/filter?status=:status",getTodosByStatus);
route.post("/odos/upload:",uploadTodoFromCSV);
route.get("/todos/download:",downloadTodoListAsCSV);

module.exports = route;