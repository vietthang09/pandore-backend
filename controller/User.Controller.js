const bcrypt = require("bcryptjs");
const db = require("../db");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../util/helper");

// CREATE
module.exports.addAccount = (req, res) => {
  try {
    const {
      user_email,
      user_phone_number,
      password,
      user_fullname,
      user_gender,
      user_address,
      user_date_of_birth,
      user_rule,
    } = req.body.data;
    const status = 0;
    var d = new Date(user_date_of_birth);

    const birthday =
      d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

    const sql = "SELECT * FROM user WHERE user_email = ? ";
    db.query(sql, [user_email], async (err, rows, fields) => {
      //Check email exist ?
      if (rows.length > 0) {
        return res.json({
          message: "The E-mail already in use",
        });
      } else if (
        user_email === "" ||
        user_phone_number === "" ||
        password === "" ||
        user_fullname === "" ||
        user_gender === "" ||
        user_address === "" ||
        user_date_of_birth === "" ||
        user_rule === ""
      ) {
        return res.json({
          message: "You are filling in missing information!!",
        });
      }
      //create password with code bcrypt
      const hashPass = await bcrypt.hash(password, 12);
      const sqlRegister =
        "INSERT INTO `user`(`user_email`,`user_phone_number`,`password`,`user_fullname`,`user_gender`,`user_address`,`user_date_of_birth`,`user_rule`,`status`) VALUES(?,?,?,?,?,?,?,?,?)";
      db.query(
        sqlRegister,
        [
          user_email,
          user_phone_number,
          hashPass,
          user_fullname,
          user_gender,
          user_address,
          birthday,
          user_rule,
          status,
        ],
        (err, rows, fields) => {
          if (err) {
            return res.json({ message: err });
          }
          return res.json({
            message: "Success",
          });
        }
      );
    });
  } catch (error) {
    return res.json({ message: error.message });
  }
};
// READ
module.exports.getUser = (req, res) => {
  try {
    const { token } = req.body;
    if (token == null) {
      return res.json({
        message: "Please provide the token",
      });
    }
    const theToken = token;
    jwt.verify(theToken, process.env.SECRECT, (err, decoded) => {
      if (err) {
        return res.json({ message: err });
      } else {
        const sql =
          "SELECT user_id,user_email,user_fullname,user_gender,user_address,user_rule,user_phone_number,user_date_of_birth FROM user WHERE user_id = ? ";
        db.query(sql, [decoded.user_id], (err, rows, fields) => {
          if (err) {
            return res.json({ message: err });
          } else {
            return res.json(rows);
          }
        });
      }
    });
  } catch (error) {
    return res.json({ message: error.message });
  }
};
module.exports.getCustomers = (req, res) => {
  db.query(
    "SELECT * FROM `user` WHERE `user_rule` = 0 ORDER BY `user_id` DESC",
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};
module.exports.getAdmins = (req, res) => {
  db.query(
    "SELECT * FROM `user` WHERE `user_rule` = 1 ORDER BY `user_id` DESC",
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};

// UPDATE
module.exports.updateProfile = (req, res) => {
  const {
    user_id,
    user_fullname,
    user_phone_number,
    user_address,
    user_gender,
    user_date_of_birth,
  } = req.body;
  const updateStatement = `
    UPDATE user
    SET user_fullname = "${user_fullname}", user_phone_number = "${user_phone_number}", user_address = "${user_address}", user_gender = "${user_gender}", user_date_of_birth = "${user_date_of_birth}"
    WHERE user_id = ${user_id}
  `;
  db.query(updateStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};
module.exports.update = (req, res) => {
  const { data } = req.body;

  var d = new Date(data.user_date_of_birth);

  const birthday =
    d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  const updateData = [
    data.user_email,
    data.user_phone_number,
    data.user_fullname,
    data.user_gender,
    data.user_address,
    birthday,
    data.user_rule,
    data.user_id,
  ];
  const updateStatement =
    "UPDATE user SET user_email = ?, user_phone_number = ?, user_fullname = ?, user_gender = ?, user_address = ?, user_date_of_birth = ?, user_rule = ? WHERE user_id = ?";
  db.query(updateStatement, updateData, (err, result) => {
    sendResponse(res, err, result);
  });
};
module.exports.updateStatusUser = (req, res) => {
  const { user_id, status } = req.body;
  const sql = "UPDATE user SET status = ? WHERE user_id = ?";
  db.query(sql, [status, user_id], (err, rows) => {
    if (err) {
      return res.json({ msg: err });
    } else {
      return res.json({ msg: "Success" });
    }
  });
};
// DELETE
module.exports.delete = (req, res) => {
  const { data } = req.body;

  const sql = "DELETE FROM user WHERE user_id = ?";
  db.query(sql, [data.id], (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.login = (req, res) => {
  try {
    const { user_email, password } = req.body;
    const sql = "SELECT * FROM user WHERE user_email = ? ";

    db.query(sql, [user_email], async (err, rows, fields) => {
      if (err) {
        return res.json({ message: err });
      }
      //Check account exist
      if (rows.length === 0) {
        return res.json({
          message: "Invalid account",
        });
      } else {
        const passMatch = await bcrypt.compare(password, rows[0].password);
        if (!passMatch) {
          return res.json({
            message: "Incorrect password",
          });
        } else {
          const token = jwt.sign(
            { user_id: rows[0].user_id },
            process.env.SECRECT,
            { expiresIn: "1h" }
          );
          return res.json({
            message: "Success",
            token: token,
            data: rows[0],
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.register = (req, res) => {
  const { email, password, fullname } = req.body;

  // check valid email
  const selectStatement = "SELECT * FROM user WHERE user_email = ? ";
  db.query(selectStatement, [email], async (err, rows, fields) => {
    if (rows.length > 0) {
      return sendResponse(res, "Your email is not valid!", rows);
    }

    //create password with code bcrypt
    const hashPass = await bcrypt.hash(password, 12);
    const insertStatement =
      "INSERT INTO `user`(`user_email`,`password`,`user_fullname`) VALUES(?,?,?)";
    db.query(
      insertStatement,
      [email, hashPass, fullname],
      (err, rows, fields) => {
        if (err) {
          return sendResponse(res, err, rows);
        }
        return sendResponse(res, null, rows);
      }
    );
  });
};
