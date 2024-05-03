const todo = require("../model/todomodel");
const csv = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');

//add new todo
exports.addTodo = async (req,res)=>{
  try{
    const {name,description, status} =req.body;
    //validation
    if(!name || !description){
        return res.status(400).json({
            success: false,
            message:"fill description section",
        })
    }

    //create entry in database
    const todoentry = await todo.create(
        {name,description, status} 
        // status: status,
    );
    return res.status(200).json({
        success: true,
        message:"todo created successfully",
        data: todoentry,

    })
  }
  catch(error){
    console.log(error);
    return res.status(404).json({
        success: false,
        error: error.message,
    })
  }

}


//fetch all todo  entries

exports.allTodos = async (req,res)=>{
    try{
        const allData = await todo.find();
            if(!allData){
                return res.status(404).json({
                    success: false,
                    message: "there is no todo entry at first create todo entry"
                })
            }

         return res.status(200).json({
            success: true,
            message:"all todos are fetched successfully",
            data: allData
         })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}
//fetch todo item by id
exports.specificTodoItem = async (req,res)=>{
    try{
        const id = req.params.id;
        const value= await todo.findById({_id:id});
        if(!value){
            return res.status(404).json({
                success: false,
                message:"the todo which you want to find is not exist"
            })
        }
        return res.status(200).json({
            success: true,
            message:"the particular todo fetched successfully",
            data: value
        })
    }
    catch(error){
        console.log(error);
        return res.status(404).json({
            success: false,
            error: error.message,
        })
    }
}

//update existing todo
exports.updateTodoItem = async (req,res)=>{
    try{
        const id = req.params.id;
        const {description, status} =req.body;
        const value= await todo.findByIdAndUpdate(
            {_id:id},

            { description:description,
                status:status,
            }
        )
        if(!value){
            return res.status(400).json({
                success: false,
                message:"Updation of todo is not successful",
            })
        }
        return res.status(200).json({
            success: true,
            message:"todo update is successful",
            data: value
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

// delete specfic todo

exports.deleteTodoItem = async (req,res)=>{
    try{
        const id = req.params.id;
        const value= await todo.findByIdAndDelete(
            {_id:id},
        )
        if(!value){
            return res.status(400).json({
                success: false,
                message:"Delete of todo is not successful",
            })
        }
        return res.status(200).json({
            success: true,
            message:"todo delete is successful",
            data: value
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}
//find by status
exports.getTodosByStatus = async (req,res)=>{
    try{
        // Extract the status parameter from the query string
        const { status } = req.query;

        // Validate the status parameter
        if (!status) {
            return res.status(400).json({
                 success: false, 
                 message: 'Status parameter is required.' 
                });
        }

        // Query the database to find todo list items with the specified status
        const filteredTodos = await todo.find({ status });

        // Send the filtered todo list items as the response
        res.status(200).json({ 
            success: true,
             todos: filteredTodos 
            });
    }
    catch(error){
        console.error('Error filtering todos:', error);
        res.status(500).json({
             success: false, 
             message: 'Internal server error.' 
            });
    }
}

//todo upload by csv
exports.uploadTodoFromCSV = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        // Read the uploaded CSV file
        const todoItems = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Process each row of the CSV file and create todo item objects
                const todoItem = {
                    name: data.name,
                    description: data.description, 
                    status: data.status || 'pending' 
                };
                todoItems.push(todoItem);
            })
            .on('end', async () => {
                // Save the parsed todo items to the database
                await todo.insertMany(todoItems);

                // Delete the uploaded file after processing
                fs.unlinkSync(req.file.path);

                // Send success response
                res.status(200).json({ 
                    success: true, 
                    message: 'Todo items uploaded successfully.' 
                });
            });
    } catch (error) {
        console.error('Error uploading todo items from CSV:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error.' 
        });
    }
};

// Download the todo list in CSV format
exports.downloadTodoListAsCSV = async (req, res) => {
    try {
        // Fetch the todo list from the database
        const todoList = await todo.find();

        // Convert todo list data to CSV format using json2csv
        const json2csvParser = new Parser();
        const csvData = json2csvParser.parse(todoList);

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="todo_list.csv"');

        // Send the CSV data as the response
        res.status(200).send(csvData);
    } catch (error) {
        console.error('Error downloading todo list as CSV:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error.'
         });
    }
};