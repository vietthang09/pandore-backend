const db = require("../db");
const { sendResponse } = require("../util/helper");
// CREATE
module.exports.create = (req, res) => {
  const { data } = req.body;
  var selectStatement = `
      SELECT * 
      FROM wishlist
      WHERE user_id = "${data.userId}" AND product_id = "${data.productId}"
    `;
  var message = "";
  db.query(selectStatement, (err, result) => {
    if (err) {
      message = err.sqlMessage;
    } else {
      if (result.length > 0) {
        message = "Product has been added";
      } else {
        var today = new Date();
        var date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();
        var time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        const created_at = date + " " + time;
        const insertStatement = `
            INSERT INTO wishlist (user_id, product_id, created_at)
            VALUES('${data.userId}', '${data.productId}', '${created_at}')
          `;
        db.query(insertStatement, (innerErr, innerResult) => {
          if (innerErr) {
            message = innerErr.sqlMessage;
          }
        });
      }
    }
    sendResponse(res, message, "Product added successful!");
  });
};
// READ
module.exports.getAllByUserId = (req, res) => {
  const userId = req.params.userId;
  var selectStatement = `
    SELECT
        *
    FROM
        wishlist
    INNER JOIN product ON product.product_id = wishlist.product_id
    WHERE wishlist.user_id = '${userId}'
    `;
  db.query(selectStatement, (err, result) => {
    var message = null;
    if (err) {
      message = err.sqlMessage;
    }
    sendResponse(res, message, result);
  });
};
module.exports.check = (req, res) => {
  const { data } = req.body;
  var selectStatement = `
    SELECT * FROM wishlist
    WHERE user_id = "${data.userId}" AND product_id= "${data.productId}"
  `;
  db.query(selectStatement, (err, result) => {
    var message = null;
    if (err) {
      message = err.sqlMessage;
    }
    sendResponse(res, message, result);
  });
};
// UPDATE
// DELETE
module.exports.delete = (req, res) => {
  const { data } = req.body;
  var deleteStatement = `
        DELETE FROM wishlist
        WHERE wishlist_id = '${data.id}'
    `;
  db.query(deleteStatement, (err, result) => {
    var message = null;
    if (err) {
      message = err.sqlMessage;
    }
    sendResponse(res, message, result);
  });
};
