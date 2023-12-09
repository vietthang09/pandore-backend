const db = require("../db");
const { sendResponse } = require("../util/helper");
// CREATE
module.exports.create = (req, res) => {
  const { user_id, comment_content, comment_star, product_id } = req.body;
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const created_at = date + " " + time;

  const insertComment =
    "INSERT INTO `comments`(`user_id`,`comment_content`,`comment_star`,`product_id`,`created_at`) VALUES(?,?,?,?,?)";

  db.query(
    insertComment,
    [user_id, comment_content, comment_star, product_id, created_at],
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};
// READ
module.exports.getCommentsProductById = (req, res) => {
  const product_id = req.params.product_id;

  db.query(
    `SELECT * FROM comments INNER JOIN user ON comments.user_id = user.user_id WHERE product_id = ${product_id} ORDER BY comments.created_at DESC`,
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};

module.exports.all = (req, res) => {
  db.query(
    `SELECT * FROM comments 
      INNER JOIN user ON user.user_id = comments.user_id 
      INNER JOIN product ON product.product_id = comments.product_id 
      ORDER BY comments.created_at DESC`,
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};
// UPDATE
// DELETE
module.exports.deleteComment = (req, res) => {
  const { comment_id } = req.body;
  const sqlDelete = `DELETE FROM comments WHERE comment_id = ?`;

  db.query(
    sqlDelete,
    [comment_id],
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};

module.exports.allRating = (req, res) => {
  db.query(
    `SELECT 
    comments.product_id, 
    product.product_name, 
    product.product_slug, 
    product.product_price, 
    product.product_discount, 
    product.product_image,
    AVG(comment_star) AS rating 
    FROM comments
    INNER JOIN product ON comments.product_id = product.product_id 
    GROUP BY comments.product_id`,
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};

