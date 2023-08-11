import { db } from "../db.js";
import jwt from "jsonwebtoken";

// GET ALL POSTS
// fetch all post in MySQL database
export const getAllPosts = (req, res) => {
  // if post contain category add in query
  const q = req.query.cat
    ? "SELECT * FROM posts WHERE cat=?"
    : "SELECT * FROM posts";
  // fetch post in db
  db.query(q, [req.query.cat], (err, data) => {
    if (err) return res.status(500).json(err);
    console.log(data);

    console.log("yesssssssssssir");
    return res.status(200).json(data);
  });
};

// GET SPECIFIC POST BY ID
export const getPost = (req, res) => {
  // create query to find post by id and get username who created post
  const q =
    "SELECT p.id, `username`, p.uid, `title`, `desc`, p.img, u.img AS userImg, `cat`, `date` FROM users u JOIN posts p ON u.id = p.uid WHERE p.id=?";

  // req.params.id --> gives you the id from url

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data[0]);
  });
};

// ADD POST TO DATABASE
export const addPost = (req, res) => {
  // check if user has token
  const token = req.cookies.userJWT;

  if (!token) return res.status(401).json("Not authenticated");

  // check if token is valid
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
    if (err) return res.status(403).json("This token is not valid");

    const q =
      "INSERT INTO posts (`title`, `desc`, `img`, `date`, `cat`, `uid`) VALUES (?)";

    const VALUES = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.date,
      req.body.cat,
      decodedToken.id,
    ];

    // anytime you insert data pass value in as an array or it will return undefined and no data will be inserted
    db.query(q, [VALUES], (err, data) => {
      if (err) return res.status(500).json(err);
      console.log(data);
      return res.status(201).json("post has been created");
    });
  });
};

// UPDATE SPECIFIC POST BY ID
export const updatePost = (req, res) => {
  // check if user has token
  const token = req.cookies.userJWT;
  if (!token) return res.status(401).json("Not Authorized");

  // check if user has token check if token is valid
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
    if (err) return res.status(403).json("Invalid token");

    // find post with id and update
    const postId = req.params.id;
    const q =
      "UPDATE posts SET `title`=?, `desc`=?, `img`=?, `cat`=? WHERE `id`=? AND `uid`=? ";

    const VALUES = [req.body.title, req.body.desc, req.body.img, req.body.cat];

    db.query(q, [...VALUES, postId, decodedToken.id], (err, data) => {
      if (err) return res.status(500).json(err);
      console.log(data);
      return res.json("Post successfully updated");
    });
  });
};

// DELETE SPECFIC POST BY ID
export const deletePost = (req, res) => {
  // check to see if user token exist;
  const token = req.cookies.userJWT;
  if (!token) return res.status(401).json("Not authorized");

  // check if token is valid
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
    if (err) return res.status(403).json("Token is not valid");

    // delete specific post by id
    const q = "DELETE FROM posts WHERE id = ? AND uid = ?";

    db.query(q, [req.params.id, decodedToken.id], (err, data) => {
      if (err) return res.status(403).json("You can't delete other users post");
      console.log("Post deleted");
      return res
        .status(200)
        .json(`Post has been deleted with id ${req.params.id}`);
    });
  });
};
