const connectToMongo = require("./db.js");
const express = require("express");
const cors = require("cors");

const app = express();

const port = 5000;

app.use(cors());
app.use(express.json());

app.listen(port,()=>{

    console.log("app running on localhost "+ port);
})

//Available routes
app.use("/api/auth",require("./routes/auth"))
app.use("/api/notes",require("./routes/notes"))



connectToMongo();

