import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  port: "3306",
  database: "blog_v1",
});
