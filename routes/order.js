const router = require("express").Router();
const {authenticateToken} = require("./userAuth")
const Book = require("../models/book")
const Order = require("../models/order")
const User = require("../models/user")


//place order

router.post("/place-order", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { order } = req.body;

        if (!order || order.length === 0) {
            return res.status(400).json({ message: "Order data is missing" });
        }

        for (const orderData of order) {
            if (!orderData._id) continue; // Skip invalid entries

            const newOrder = new Order({ user: id, book: orderData._id });
            const orderDataFromDb = await newOrder.save();

            await User.findByIdAndUpdate(id, { $push: { orders: orderDataFromDb._id } });
            await User.findByIdAndUpdate(id, { $pull: { cart: orderData._id } });
        }

        return res.json({
            status: "Success",
            message: "Order placed successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

//order histlry

router.get("/get-order-history", authenticateToken , async(req,res)=>{
    try{
        const {id} = req.headers
        const userData = await User.findById(id).populate({
            path:"orders",
            populate:{path:"book"},
        });
        const ordersData = userData.orders.reverse()
        return res.json({
            status :"Sucess",
            data: ordersData,
        })
    }catch(error){
        return res.status(500).json({ message: "An error occurred", error: error.message });


    }
})


//a get all use 

router.get("/get-all-orders", authenticateToken, async (req, res) => {
    try {
        const userData = await Order.find()
            .populate({
                path: "book",
            })
            .populate({
                path: "user",
                select: "name email  username  address", // Include the user's address
            })
            .sort({ createdAt: -1 });

        return res.json({
            status: "Success",
            data: userData,
        });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});



router.put("/update-status/:id", authenticateToken,async(req,res)=>{
    try {
        const {id} = req.params
      
        await Order.findByIdAndUpdate(id,{status: req.body.status })
        
        return res.json({status:"Suceess",message:"updated"})
        
    } catch (error) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
        
    }
})



module.exports = router;