const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  snippet: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String, // optional, for image URL if you want to use thumbnail images
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
