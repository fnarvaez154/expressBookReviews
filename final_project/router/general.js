const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req,res) => {
    
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
//res.send(JSON.stringify(books,null));
  try {
    // Simulating fetching books using a promise
    const getBooks = new Promise((resolve, reject) => {
      setTimeout(() => resolve(books), 100); // simulate delay
    });

    const allBooks = await getBooks;
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book list" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const authorName = req.params.author.toLowerCase();

    const getBooksByAuthor = new Promise((resolve) => {
      const result = {};
      for (let key in books) {
        if (books[key].author.toLowerCase() === authorName) {
          result[key] = books[key];
        }
      }
      resolve(result);
    });

    const filteredBooks = await getBooksByAuthor;

    if (Object.keys(filteredBooks).length > 0) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching books by author" });
  }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleName = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
    const result = {};
    for (let key in books) {
      if (books[key].title.toLowerCase() === titleName) {
        result[key] = books[key];
      }
    }

    if (Object.keys(result).length > 0) {
      resolve(result);
    } else {
      reject("No books found with this title");
    }
  })
    .then((bookList) => res.status(200).json(bookList))
    .catch((err) => res.status(404).json({ message: err }));
});



//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const bookReviews = books[isbn].reviews
    return res.send(bookReviews);
  } else {
    res.status(404).json({message : "No ISBN found"});
  }
  
});

module.exports.general = public_users;
