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
route.get("/todos/filter/:status",getTodosByStatus); 
route.post("/todos/upload",uploadTodoFromCSV);
route.get("/todos-list/fetch",downloadTodoListAsCSV);

module.exports = route;