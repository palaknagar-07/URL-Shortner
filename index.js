const express = require("express");
const urlRoute = require("./routes/url");
const { connectMongoDB } = require("./connect");
const URL = require("./models/url");
const app = express();
const PORT = 8001;



connectMongoDB("mongodb://localhost:27017/short-url")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB");
    });

app.use(express.json());

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOne({ shortId });
    if (!entry) return res.status(400).json({ error: "Short URL not found" });
    await URL.findOneAndUpdate({
        shortId: shortId,
    }, {
        $push:
        {
            visitHistory:
                { timestamp: Date.now() }
        }
    });
    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

