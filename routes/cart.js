const router = require("express").Router();
const mongoose = require("mongoose");  // ✅ Fix: Import mongoose
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

router.put("/add-book-to-cart", authenticateToken, async (req, res) => {
    try {
        console.log("🔵 Request received to add book to cart");

        const { bookid } = req.body;
        const { id } = req.headers;

        console.log("🟢 Received:", { bookid, id });

        if (!bookid || !id) {
            console.log("❌ Missing book ID or user ID");
            return res.status(400).json({ message: "Missing book ID or user ID" });
        }

        const userData = await User.findById(id);
        if (!userData) {
            console.log("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("🟢 User Data Found:", userData);

        // Validate bookid as MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookid)) {
            console.log("❌ Invalid book ID format");
            return res.status(400).json({ message: "Invalid book ID format" });
        }

        const bookObjectId = new mongoose.Types.ObjectId(bookid);
        console.log("🟢 Converted Book ID:", bookObjectId);

        // Check if book is already in cart
        const isBookInCart = userData.cart.some((cartItem) => cartItem.equals(bookObjectId));
        if (isBookInCart) {
            console.log("🟡 Book is already in cart");
            return res.status(200).json({ message: "✅ Book is already in cart" });
        }

        // Add book to cart
        await User.findByIdAndUpdate(id, { $push: { cart: bookObjectId } });
        console.log("🟢 Book added to cart successfully!");

        return res.status(200).json({ status: "Success", message: "Book added to cart" });

    } catch (error) {
        console.error("🔥 Error in add-book-to-cart route:", error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// Other routes remain unchanged...

router.put("/remove-book-from-cart/:bookid", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.params;
        const { id } = req.headers;

        if (!id) {
            return res.status(400).json({ status: "Fail", message: "User ID is required" });
        }

        const userData = await User.findById(id);
        if (!userData) {
            return res.status(404).json({ status: "Fail", message: "User not found" });
        }

        await User.findByIdAndUpdate(id, { $pull: { cart: bookid } });

        return res.status(200).json({ status: "Success", message: "Book removed from cart" });

    } catch (error) {
        console.error("❌ Error removing book from cart:", error);
        return res.status(500).json({ status: "Error", message: "An error occurred", error: error.message });
    }
});



router.get("/get-user-cart", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        console.log("Received User ID:", id); // ✅ Debugging

        const userData = await User.findById(id).populate("cart");
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cart = userData.cart ? userData.cart.reverse() : [];
        return res.json({ status: "Success", data: cart });

    } catch (error) {
        console.error("🔥 Error fetching user cart:", error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});



module.exports = router;