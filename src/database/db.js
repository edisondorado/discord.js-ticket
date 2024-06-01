const mongoose = require("mongoose");
module.exports = mongoose.connect(
  "mongodb+srv://<name>:<password>@cluster0.wx2utu1.mongodb.net/?retryWrites=true&w=majority"
);
