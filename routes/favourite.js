const router = require("express").Router();
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

// 🟢 ADD TO FAVOURITES
router.put("/add-book-to-favourite", authenticateToken, async (req, res) => {
    try {
        console.log("🔵 Request received to add book to favourite");

        const { bookid } = req.body;  // ✅ Extract from body
        const { id } = req.headers;   // ✅ Extract user ID from headers

        console.log("🟢 Received:", { bookid, id });

        if (!bookid || !id) {
            return res.status(400).json({ message: "Missing book ID or user ID" });
        }

        const userData = await User.findById(id);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("🟢 User Data Found:", userData);

        const isBookFavourite = userData.favourites.includes(bookid);
        if (isBookFavourite) {
            return res.status(200).json({ message: "✅ Book is already in favourites" });
        }

        await User.findByIdAndUpdate(id, { $push: { favourites: bookid } });
        console.log("🟢 Book added to favourites successfully!");

        return res.status(200).json({ message: "Book added to favourites" });

    } catch (error) {
        console.error("🔥 Error in add-book-to-favourite route:", error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// 🟢 REMOVE FROM FAVOURITES
router.delete("/remove-book-from-favourite", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.body;  // ✅ Extract from body
        const { id } = req.headers;

        console.log("🔵 Request to remove from favourites:", { bookid, id });

        if (!bookid || !id) {
            return res.status(400).json({ message: "Missing book ID or user ID" });
        }

        const userData = await User.findById(id);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const isBookFavourite = userData.favourites.includes(bookid);
        if (isBookFavourite) {
            await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
            console.log("🟢 Book removed from favourites");
            return res.status(200).json({ message: "Book removed from favourites" });
        } else {
            return res.status(400).json({ message: "Book is not in favourites" });
        }

    } catch (error) {
        console.error("🔥 Error in remove-book-from-favourite:", error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// 🟢 GET FAVOURITE BOOKS
router.get("/get-favourite-book", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;

        console.log("🔵 Fetching favourites for user:", id);

        if (!id) {
            return res.status(400).json({ message: "Missing user ID" });
        }

        const userData = await User.findById(id).populate("favourites");  // ✅ Ensure "favourites" is correct
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const favouriteBooks = userData.favourites.reverse();
        return res.status(200).json({ status: "Success", data: favouriteBooks });

    } catch (error) {
        console.error("🔥 Error in get-favourite-book:", error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

module.exports = router;
