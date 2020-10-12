const { db } = require("../db");
const jwt = require("jsonwebtoken");
const bcrycpt = require("bcryptjs");
require("dotenv").config();
exports.signup = (req, res) => {
  const { name, email, password, tlpn_number } = req.body;

  db.query(
    "SELECT email FROM user WHERE email = ?",
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      }
      if (result.length > 0) {
        return res.send({ message: "Email Has Been Taken" });
      }
      let hashedPassword = await bcrycpt.hash(password, 8);

      db.query(
        "INSERT INTO user VALUES (?,?,?,?,?)",
        [Date.now(), name, email, hashedPassword, tlpn_number],
        (error, result) => {
          if (error) {
            console.log(error);
            res.send({ error });
          } else {
            console.log(result);
            return res.send({
              message: "created account success",
            });
          }
        }
      );
    }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Email or Password is empty" });
    }
    db.query(
      "SELECT * FROM user WHERE email=?",
      [email],
      async (error, result) => {
        console.log(result);
        if (
          result.length < 1 ||
          !(await bcrycpt.compare(password, result[0].password))
        ) {
          res.status(401).send({ message: "Email or Password Incorect" });
        } else {
          const id = result[0].id;
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });
          console.log("the token is" + token);
          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };
          res.cookie("jwt", token, cookieOptions);
          res.status(200).send({ message: "login successfull", token });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
