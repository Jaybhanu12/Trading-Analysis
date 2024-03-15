import { connectDB } from "./Database/mongodb.js";
import { run } from "./Utils/files.utils.js";
import { app } from "./app.js";
import dotenv from "dotenv";

//env file config
dotenv.config({path: "./.env"});

//database with server

connectDB()
.then(()=>{
  app.listen(`${process.env.PORT}`|| 5000,async()=>{
    console.log(`Server is Working On ${process.env.PORT}`)
    await run()
  }
  )
})
.catch((error)=>{
    console.log(error);
})  