const db = require("../db");
const uuid = require("uuid");
const { sendResponse } = require("../util/helper");
// CREATE
module.exports.create = (req, res) => {
  const { data } = req.body;
  var insertValues = [];
  const charHash = uuid.v4();
  data.map((item) => {
    insertValues.push([
      charHash,
      item.categoryId,
      item.attributeId,
      item.value,
    ]);
  });
  const insertStatement = `
    INSERT INTO characteristics
    (
        characteristics_hash,
        category_id,
        attribute_id,
        value
    ) VALUES ?
  `;
  db.query(insertStatement, [insertValues], (err, result) => {
    if (err) {
      sendResponse(res, err, result);
    } else {
      sendResponse(res, err, charHash);
    }
  });
};
// READ
// UPDATE
// DELETE
