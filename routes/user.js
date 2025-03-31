const router = require("express").Router();
const User = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {authenticateToken }= require("./userAuth")
router.post("/sign-up", async (req, res) => {
    try {
        console.log("Received Data:", req.body); // Log incoming request data

        const { username, email, password, address } = req.body;

        if (!username || !email || !password || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (username.length < 4) {
            return res.status(400).json({ message: "User name should be greater than 3" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "User name already exists" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashPass,
            address
        });

        await newUser.save();

        return res.status(201).json({ message: "Signup Successfully" });

    } catch (error) {
        console.error("Error in /sign-up route:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


//sigin

router.post("/sign-in", async (req, res) => {
    try {
        const {username,password} = req.body;

        const existingUser = await User.findOne({username})
        if(!existingUser){
            res.status(400).json({message:"Invalid credentials"})

        }
        await bcrypt.compare(password,existingUser.password,(err,data)=>{
            if(data){
                const authClaims = [
                    {name: existingUser.username},{role: existingUser.role},
                ]
                const token = jwt.sign({authClaims},"bookStore123",{
                    expiresIn : "30d",
                })
                res.status(200).json({id: existingUser._id,role: existingUser.role,token : token });
            }
            else{
                 return res.status(400).json({ message: "Ivaild data"})

            }
        })
        
    } catch (error) {
        console.error("Error in /sign-up route:", error);  // Logs error to the console
        return res.status(400).json({ message: "Internal server error", error: error.message });
    }
});


//get user 

router.get("/get-user-information",authenticateToken,async(req,res)=>{
    try {
        const {id } = req.headers
        const data = await User.findById(id)
        return res.status(200).json(data);
        
    } catch (error) {
        res.status(500).json({message:"Internal sever error"})
        
    }
})

router.put("/update-address",authenticateToken,async(req,res)=>{
    try{
        const {id} = req.headers;
        const {address} = req.body;
        await User.findByIdAndUpdate(id,{address: address})
        return res.status(200).json({message:"Address updated successflly"})

    }catch(error){
        res.status(500).json({message:"Internal server error"})
    }
})

module.exports = router;