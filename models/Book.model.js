const mongoose = require("mongoose");


const bookSchema = new mongoose.Schema({              // mode   
  ISBN: {
    type: String,
    unique: true,
  },
  author: {
    type: String,
    trim: true,
    required: true
  },
  authorSlug: {
    type: String,
    lowercase: true,
  },
  titleSlug: {
    type: String,
    lowercase: true,
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    trim: true,
    required: [true, 'Book price is required'],
  },
  description: {
    type: String,
    required: [true, 'Book Description is required'],
  },
  reviews: [
    {
      by: mongoose.Schema.Types.ObjectId,
      review: String,
    }
  ],
  createdby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
},
  { timestamps: true }

)

const Book = mongoose.model("Book", bookSchema)

module.exports = Book;


// const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
// module.exports = Book;

