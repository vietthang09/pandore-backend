const db = require("../db");
const uuid = require("uuid");
const {
  sendResponse,
  orderSuccessfulTemplate,
  getCurrentDateTime,
} = require("../util/helper");
const { sendMail } = require("../util/email");

// CREATE
module.exports.postOrder = (req, res) => {
  var {
    dataProduct,
    user_id,
    fullname,
    email,
    phonenumber,
    address,
    total_price,
    method_payment,
    voucher,
  } = req.body;

  if (voucher) {
    total_price = total_price - (total_price / 100) * voucher.discount;
  }

  const order_id = "order_" + uuid.v4();
  const status = 0;

  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const created_at = date + " " + time;
  const update_at = date + " " + time;

  const values = [
    order_id,
    user_id,
    fullname,
    email,
    phonenumber,
    address,
    total_price,
    voucher ? voucher.id : null,
    method_payment,
    status,
    created_at,
    update_at,
  ];

  const sql_Order =
    "INSERT INTO `orders` (`order_id`,`user_id`, `fullname`,`email`,`phonenumber`,`address`,`total_price`,`voucher_id`,`method_payment`,`status`,`created_at`,`update_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
  db.query(sql_Order, values, (err, rows, fields) => {
    if (err) {
      console.log(err);
    } else {
      dataProduct.map((item) => {
        const product_id = item.product_id;
        const description = item.description;
        const data = [
          order_id,
          product_id,
          item.product_name,
          item.quantity,
          description,
          item.price,
          created_at,
          update_at,
        ];
        const sql_Order_Details =
          "INSERT INTO `orderdetail` (`order_id`, `product_id`,`product_name`,`quantity`,`description`,`price`,`created_at`,`update_at`) VALUES (?,?,?,?,?,?,?,?)";
        db.query(sql_Order_Details, data, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });
      const htmlBody = orderSuccessfulTemplate(
        order_id,
        dataProduct,
        address,
        voucher ? voucher.discount : null,
        total_price,
        method_payment == 0 ? "Pay with Paypal" : "Pay with Stripe",
        created_at
      );
      if (method_payment == 0 || method_payment == 1) {
        sendMail(email, "[SKA Buy] Order successful", htmlBody);
        dataProduct.map((item) => {
          var updateStatement = `
          UPDATE characteristics_product
          SET total = total - ${item.quantity}
          WHERE product_id = '${item.product_id}' AND characteristics_hash = '${item.hash}'`;
          db.query(updateStatement, (err, result) => {
            if (err) {
              console.log(err);
            }
          });
        });
        if (voucher) {
          var deleteStatement = `
          UPDATE voucher 
          SET used = used + 1
          WHERE id = '${voucher.id}'
        `;
          db.query(deleteStatement, (err, result) => {
            if (err) {
              console.log(err);
            }
          });
        }
      }
      sendResponse(res, "", { htmlBody: htmlBody, orderId: order_id });
    }
  });
};
// READ
module.exports.getOrders = (req, res) => {
  const sql = "SELECT * FROM `orders`";
  db.query(sql, (err, rows) => {
    sendResponse(res, err, rows);
  });
};

module.exports.getOrdersByUserId = (req, res) => {
  const user_id = req.params.id;
  const selectStatement = `
    SELECT *
    FROM orders
    LEFT JOIN voucher ON voucher.id = orders.voucher_id
    WHERE user_id = ${user_id}
  `;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getOrder = (req, res) => {
  const id = req.params.id;
  const selectStatement = `
    SELECT *
    FROM orderdetail
    INNER JOIN product ON product.product_id = orderdetail.product_id 
    WHERE orderdetail.order_id = '${id}'
  `;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getOrderWithDateFilter = (req, res) => {
  const { data } = req.body;
  const selectStatement = `
  SELECT
    *
  FROM
    orders
  WHERE
    (
        orders.created_at >= "${data.start}" AND orders.created_at <= "${data.end}"
    )
  `;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getOrderStatistic = (req, res) => {
  const { data } = req.body;
  const selectStatement = `
  SELECT
    SUBSTRING_INDEX(orders.created_at, " ", 1) AS "date",
    orders.status,
    COUNT(orders.status) AS "total"
  FROM
    orders
  WHERE
    (
      orders.created_at >= "${data.start}" AND orders.created_at <= "${data.end}"
    )
  GROUP BY
    orders.status,
    SUBSTRING_INDEX(orders.created_at, " ", 1)
  `;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};
// UPDATE
module.exports.updateStatus = (req, res) => {
  const { data } = req.body;
  const updateData = [data.status, getCurrentDateTime(), data.id];

  const updateStatement = `
    UPDATE orders
    SET 
      status = ?,
      update_at = ?
    WHERE order_id = ?
  `;
  db.query(updateStatement, updateData, (err, result) => {
    sendResponse(res, err, result);
  });
};
// DELETE
