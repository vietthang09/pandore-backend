const db = require("../db");
const { sendResponse } = require("../util/helper");

// CREATE
module.exports.create = (req, res) => {
  const { data } = req.body;

  const insertData = [data.type, data.unit];
  const insertStatement = `
  INSERT INTO attribute (type, unit) VALUES (?,?)
  `;
  db.query(insertStatement, insertData, (err, result) => {
    sendResponse(res, err, result.insertId);
  });
};
// READ
module.exports.getAttributesByProductId = (req, res) => {
  const id = req.params.id;

  const selectStatement = `
    SELECT
        characteristics_product.characteristics_hash,
        GROUP_CONCAT(
            CONCAT(
                attribute.type,
                ": ",
                characteristics.value,
                COALESCE(attribute.unit, '')
            ) SEPARATOR '; '
        ) AS 'values',
        characteristics_product.total
    FROM
        characteristics_product
    INNER JOIN characteristics ON characteristics.characteristics_hash = characteristics_product.characteristics_hash
    INNER JOIN attribute ON attribute.attribute_id = characteristics.attribute_id
    WHERE
        characteristics_product.product_id = ${id}
    GROUP BY
        characteristics_product.characteristics_hash`;

  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getAttributesByKeyword = (req, res) => {
  const keyword = req.params.keyword;
  const selectStatement = `
    SELECT *
    FROM attribute
    WHERE type LIKE "%${keyword}%"
  `;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

// UPDATE
// DELETE
