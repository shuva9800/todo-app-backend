const express= require('express');
const app = express();
require("dotenv").config();
const {dbconnect} = require("./config/database")
const todolistRoute = require("./routs/todorouts");


//database connection
dbconnect();
app.use(express.json());
//port 
const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
    console.log(`app started successfully at port ${PORT}`);
});

//routing
app.use("/api/v1",todolistRoute);

app.get("/", (req,res)=>{
    return res.status(400).json({
        success: true,
        message:"<h2>welloce to backend</h2>"
    })
})
