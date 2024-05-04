const todo = require("../model/todomodel");
const csv = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');
const { createObjectCsvWriter } = require('csv-writer');


//add new todo
exports.addTodo = async (req,res)=>{
  try{
    const {name,description, status} =req.body;
    console.log(req);
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
        const {status}  = req.params; 
        
        // Validate the status parameter
        if (!status) {
            return res.status(400).json({
                 success: false, 
                 message: 'Status parameter is required.' 
                });
        }
       console.log(status)
        // Query the database to find todo list items with the specified status
        const filteredTodos = await todo.find({status});
        console.log("the  todo is base on status", filteredTodos)
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
        if (!req.files) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const file = req.files.file;
        file.mv(`uploads/${file.name}`, (err) => {
            if (err) {
              return res.status(500).send(err);
            }
        
        // Read the uploaded CSV file
        const todoItems = [];
        fs.createReadStream(`uploads/${file.name}`)
      .pipe(csv())
            .on('data', (data) => {
                // const todoItem = {
                //     name: data.name,
                //     description: data.description, 
                //     status: data.status || 'pending' 
                // };
                    todoItems.push(data);
                
            })
            .on('end', async () => {
                // Save the parsed todo items to the database
                await todo.insertMany(todoItems);

                // Delete the uploaded file after processing
                fs.unlinkSync(`uploads/${file.name}`);

                // Send success response
                res.status(200).json({ 
                    success: true, 
                    message: 'Todo items uploaded successfully.',
                    data:todoItems 
                });
                // res.json(todoItems);
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
        // Fetch data from MongoDB using your model
        const data = await todo.find({}).lean();

        // Specify the CSV file path
        const csvFilePath = 'output.csv';

        // Create a CSV writer
        const csvWriter = createObjectCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'name', title: 'Name' },
                { id: 'description', title: 'Description' },
                { id: 'status', title: 'Status' },
                // Add headers for other fields if needed
            ]
        });

        // Write data to the CSV file
        await csvWriter.writeRecords(data);

        // Send the CSV file as a response
        res.download(csvFilePath, 'output.csv', (err) => {
            if (err) {
                console.error('Error sending CSV file', err);
                res.status(500).send('Error exporting data to CSV');
            } else {
                console.log('CSV file sent successfully');
            }
        });
    } catch (err) {
        console.error('Error exporting data to CSV', err);
        res.status(500).send('Error exporting data to CSV');
    }
};

