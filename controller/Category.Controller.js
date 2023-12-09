const { default: slugify } = require("slugify");
const db = require("../db");
const { sendResponse } = require("../util/helper");
// CREATE
module.exports.create = (req, res) => {
  const { data } = req.body;
  const insertData = [data.name, slugify(data.name), data.image];
  const insertStatement =
    "INSERT INTO category(category_name,category_slug,category_image) VALUES (?,?,?)";
  db.query(insertStatement, insertData, (err, result) => {
    sendResponse(res, err, result);
  });
};
// READ
module.exports.all = (req, res) => {
  db.query(`SELECT * FROM category`, (err, result) => {
    sendResponse(res, err, result);
  });
};
// UPDATE
module.exports.update = (req, res) => {
  const { data } = req.body;
  const updateData = [data.name, slugify(data.name), data.image, data.id];
  const updateStatement =
    "UPDATE category SET category_name=?,category_slug=?,category_image=? WHERE category_id = ?";
  db.query(updateStatement, updateData, (err, result) => {
    sendResponse(res, err, result);
  });
};

// DELETE
module.exports.delete = (req, res) => {
  const { data } = req.body;
  const deleteStatement = `
    DELETE FROM category WHERE category_id = "${data}"
  `;
  db.query(deleteStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};
