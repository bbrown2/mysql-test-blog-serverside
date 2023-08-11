import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import usersRoutes from "./routes/users.js";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import "dotenv/config";

const app = express();
// MIDDLEWARE
app.use(express.json()); // allow request to be readable in json format
app.use(cookieParser()); // allow us to create cookies in header with data
app.use(cors()); // allow us to connect backend api to frontend app

const __filename = fileURLToPath(import.meta.url); // get access to url path (NEED when using module "import" instead of "require")
const __dirname = path.dirname(__filename); // get the current path of directory
const buildPath = path.join(__dirname, "../client/build"); // get the build path on client side
// console.log(__dirname);
app.use(express.static(buildPath)); // need for react css/js to work on hosting

// this will run our react static files (css, images, etc)
app.get("*", async (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"), (err) => {
    if (err) return res.status(500).send(err);
  });
});

// upload images to server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), function (req, res) {
  // get file
  const file = req.file;
  // console.log(file);
  return res.status(200).json(file.filename);
});

//predefined api routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
