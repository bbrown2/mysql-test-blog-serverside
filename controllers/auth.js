import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT TOKEN FOR USER
// create a function to create jwt for user --> we will use this mutiple times(resuable function)

// create variable that tracks expire time for jsonwebtoken and cookie
const expire = 86400; // 1 day in seconds
const createToken = (id) => {
  // first argument ---> pass in the payload => data from backend server
  // second argument ---> create a secret to access & secure the jwt
  // third argument ---> optional object (can expire the jwt)
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "24h" || expire,
  });
};

// REGISTER USER
export const register = (req, res) => {
  // check existing user
  const q = "SELECT * FROM users WHERE username = ? OR email = ?";

  // run query (query statement, form data, callbckFn(error, data))
  db.query(q, [req.body.username, req.body.email], (err, data) => {
    // if error occur
    if (err) return res.json(err);
    // console.log(data);
    // if user exist, then throw err
    if (data.length) return res.status(409).json("User already exists");

    // hash user password before saving to database
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    // write query to insert user into database
    const q = "INSERT INTO users (username, email, password) VALUES (?)";
    const VALUES = [req.body.username, req.body.email, hash];

    // =================================================================================
    //                                THIS NEED WORK -begin
    // =================================================================================
    // Create a error handling function to handle all user errors during register/login
    // =================================================================================

    if (
      req.body.username == "" ||
      req.body.email == "" ||
      req.body.password == ""
    )
      return res.status(400).json("All input fields are required");

    // =================================================================================
    //                                THIS NEED WORK -end
    // =================================================================================

    db.query(q, [VALUES], (err, data) => {
      if (err) return res.json(err);
      return res.status(201).json("User successfully added to database");
    });
  });
};

// LOGIN USER
export const login = (req, res) => {
  // check to see if user exist already in db
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    // check for errors
    if (err) return res.json(err);
    // =================================================================================
    //                                THIS NEED WORK -begin
    // =================================================================================
    // Create a error handling function to handle all user errors during register/login
    // =================================================================================

    if (req.body.username == "" || req.body.password == "")
      return res.status(400).json("All input fields are required");

    // =================================================================================
    //                                THIS NEED WORK -end
    // =================================================================================

    // see if data array is empty, if empty then user don't exist
    if (!data.length)
      return res
        .status(400)
        .json("No account found with this username or email");

    console.log(data);
    const hashedPassword = data[0].password;
    // check if passwords match if user exist
    const isMatch = bcrypt.compareSync(req.body.password, hashedPassword);
    if (!isMatch) return res.status(400).json("Wrong username or password");

    // call token function to create token and pass in the user id --> now our token contains current logged in user id
    const token = createToken(data[0].id);
    // options -> {httpOnly: true} no can't access the cookie through js frontend
    // options -> {secure: true} cookies are only accessed on https sites
    // options -> {maxAge: 86400 * 1000} cookie will expire in milliseconds, multiply by 1,000 to get seconds (cookie will expire in 1 day)
    // create cookie for frontend, then store token inside
    const { password, ...other } = data[0]; // exclude password when sending data back to user via cookie
    console.log(other);
    res
      .cookie("userJWT", token, { httpOnly: true, maxAge: expire * 1000 })
      .status(200)
      .json(other);

    // res.status(201).json(`Successfully logged in as ${data[0].username}`);
  });
};
export const logout = (req, res) => {
  // remove cookie from frontend when logging user out
  res
    .clearCookie("userJWT", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User successfully logged out");
};
