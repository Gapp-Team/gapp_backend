
const config = require("config");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");


const products = require("./routes/products");
const categories = require("./routes/categories");
const users = require("./routes/users");
const home = require("./routes/home");


app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["*"]
}));

app.use("/api/products" ,products);
app.use("/api/categories" ,categories);
app.use("/api/users" ,users);
app.use("/", home);

const username = config.get("db.username");
const password = config.get("db.password");
const database = config.get("db.name");



(async () => {
    try {
        await mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.4vfridc.mongodb.net/${database}?retryWrites=true&w=majority`);
        console.log("mongodb bağlantısı kuruldu.");
    }
    catch(err) {
        console.log(err);
    }
})();

if(process.env.NODE_ENV == "production") {
    require("./startup/production")(app);
}


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});




