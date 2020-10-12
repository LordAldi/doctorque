const express = require("express");
const { db } = require("./db");
const helmet = require("helmet");
const auth = require("./routes/auth");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
db.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("MYSQL Connected");
  }
});
//routes
app.use("/auth", auth);

app.get("/", (req, res) => {
  const querySql = "Select * FROM user";
  db.query(querySql, (reqq, ress) => {
    res.send(ress);
  });
});

const port = process.env.PORT || 2121;
app.listen(port, () => console.log(`listening on port ${port}...`));
