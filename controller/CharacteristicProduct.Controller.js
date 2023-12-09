const db = require("../db");
const { sendResponse } = require("../util/helper");
// CREATE
module.exports.create = (req, res) => {
  const { data } = req.body;
  const insertValues = [data.productId, data.attHash, data.total];
  const insertStatement = `
    INSERT INTO characteristics_product
    (
        product_id,
        characteristics_hash,
        total
    ) VALUES (?, ?, ?)
  `;
  db.query(insertStatement, insertValues, (err, result) => {
    sendResponse(res, err, result);
  });
};
// READ
// UPDATE
module.exports.update = (req, res) => {
  const { data } = req.body;
  const updateData = [data.total, data.id, data.hash];
  const updateStatement = `
  UPDATE characteristics_product
  SET 
    total = ?
  WHERE product_id = ? AND characteristics_hash = ?
  `;
  db.query(updateStatement, updateData, (err, result) => {
    sendResponse(res, err, result);
  });
};
// DELETE
