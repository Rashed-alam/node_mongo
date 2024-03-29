// db.js
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;


console.log("mongodb uri",uri)
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB server');
    })
    .catch((error) => {
        console.error(error);
    });

module.exports = mongoose;
