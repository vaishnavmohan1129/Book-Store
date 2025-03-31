const router = require("express").Router();
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const Book = require("../models/book")
const {authenticateToken }= require("./userAuth")


router.post("/add-book", authenticateToken, async (req, res) => {
    console.log("📩 Request received at /add-book"); // Debugging
    try {
        const { id } = req.headers;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only" });
        }

        const book = new Book({
            url: req.body.url,
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            desc: req.body.desc,
            language: req.body.language,
        });

        await book.save();
        res.status(201).json({ message: "✅ Book added successfully" });
    } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
//update book
router.put("/update-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;

        if (!bookid) {
            return res.status(400).json({ message: "Book ID is required in headers" });
        }

        const updatedBook = await Book.findByIdAndUpdate(
            bookid,
            {
                url: req.body.url,
                title: req.body.title,
                author: req.body.author,
                price: req.body.price,
                desc: req.body.desc,
                language: req.body.language,
            },
            { new: true } // This returns the updated book
        );

        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book updated successfully", updatedBook });
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


//delete book
router.delete("/delete-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;

        if (!bookid) {
            return res.status(400).json({ message: "Book ID is required" });
        }

        const deletedBook = await Book.findOneAndDelete({ _id: bookid });

        if (!deletedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json({
            message: "Book deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting book:", error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});


//get all books 

router.get("/get-all-books",async(req,res)=>{
    try {
        const books = await Book.find().sort({createdAt:-1})
        return res.json({
            status: "Sucees",
            data: books,
        })
        
    } catch (error) {

        return res.status(500).json({message:"An error occured"})
        
    }
})

//only for books

router.get("/get-recent-books",async(req,res)=>{
    try {
        const books = await Book.find().sort({createdAt:-1}).limit(4)
        return res.json({
            status: "Sucees",
            data: books,
        })
        
    } catch (error) {

        return res.status(500).json({message:"An error occured"})
        
    }
})


router.get("/get-book-by-id/:id",async(req,res)=>{
    try {
       const {id} = req.params;
       const book = await Book.findById(id)
        return res.json({
            status: "Sucees",
            data: book,
        })
        
    } catch (error) {

        return res.status(500).json({message:"An error occured"})
        
    }
})




module.exports = router;
