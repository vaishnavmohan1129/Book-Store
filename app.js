const express = require("express");
const app = express();
const cors = require("cors")
app.use(express.json())

require("dotenv").config();

require("./conn/conn");

const user = require("./routes/user")
const Books = require("./routes/book")
const Favourite = require("./routes/favourite")
const Cart = require("./routes/cart")
const Order = require("./routes/order")
app.use(cors())

app.use("/api/v1/user", user);
app.use("/api/v1/book", Books);
app.use("/api/v1/favourite", Favourite);
app.use("/api/v1", Cart);
app.use("/api/v1", Order);

app.listen(process.env.PORT, ()=>{
    console.log(`Sever started ${process.env.PORT}`);
})