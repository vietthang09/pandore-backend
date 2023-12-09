const db = require("../db");
var slugify = require("slugify");
const {
  sendResponse,
  mergeDuplicateAttributes,
  getCurrentDateTime,
} = require("../util/helper");

module.exports.checkValidName = (req, res) => {
  const keyword = req.params.keyword;

  const slug = slugify(keyword);
  const selectStatement = `
    SELECT *
    FROM product
    WHERE product_slug = "${slug}"
  `;
  db.query(selectStatement, (err, result) => {
    if (err) {
      sendResponse(res, err, result);
    } else {
      if (result.length == 0) {
        sendResponse(res, err, "OK");
      } else {
        sendResponse(res, err, "Invalid Name");
      }
    }
  });
};

//CREATE
module.exports.create = (req, res) => {
  const { data } = req.body;
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const created_at = date + " " + time;
  const insertData = [
    data.name,
    data.trademark,
    slugify(data.name),
    data.description,
    data.price,
    data.discount,
    data.image,
    data.imageDes1,
    data.imageDes2,
    data.categoryId,
    0,
    created_at,
  ];

  const insertStatement = `INSERT INTO product
    (
      product_name, 
      trademark, 
      product_slug, 
      product_description, 
      product_price, 
      product_discount, 
      product_image,
      image_description1,
      image_description2,
      category_id,
      status,
      create_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(insertStatement, insertData, (err, result) => {
    sendResponse(res, err, result.insertId);
  });
};
//READ
module.exports.getAllProduct = (req, res) => {
  const selectStatement = `
  SELECT
    *
  FROM
    product
  INNER JOIN category ON category.category_id = product.category_id
  ORDER BY
    product.create_at
  DESC`;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getTopProducts = (req, res) => {
  db.query(
    `
  SELECT
  *,
      (
      SELECT
          AVG(comments.comment_star)
      FROM
          comments
      WHERE
          comments.product_id = t.product_id
  ) AS rating,
  (
      SELECT
          COUNT(comments.comment_id)
      FROM
          comments
      WHERE
          comments.product_id = t.product_id
  ) AS comment_total
  FROM
      product AS t
  ORDER BY
      product_id
  DESC
  LIMIT 16
  `,
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};

module.exports.getPromotionalProducts = (req, res) => {
  db.query(
    "SELECT * FROM `product` WHERE `product_discount` > 0 ORDER BY `product_discount` DESC LIMIT 16",
    (err, result) => {
      sendResponse(res, err, result);
    }
  );
};

module.exports.getProductsByCategoryID = (req, res) => {
  const category_id = req.params.category_id;
  const selectStatement = `SELECT * FROM product where category_id = ${category_id}`;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getRelatedProducts = (req, res) => {
  const category_id = req.params.id;
  const selectStatement = `SELECT * FROM product where category_id = ${category_id} LIMIT 8`;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getAttributeByCategoryID = (req, res) => {
  const category_id = req.params.category_id;
  var maximumPrice = 0;
  var trademarks = [];
  // max price
  db.query(
    `SELECT MAX(product_price)
    FROM product
    WHERE category_id = ${category_id}`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        maximumPrice = Object.values(result[0])[0];
      }
    }
  );
  // all trademark
  db.query(
    `SELECT trademark
    FROM product
    WHERE category_id = ${category_id}
    GROUP BY trademark`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        result.map((item) => {
          trademarks.push(item.trademark);
        });
      }
    }
  );
  // attributes
  const selectStatement = `SELECT
                            characteristics.attribute_id,
                            attribute.type,
                            characteristics.value,
                            attribute.unit
                          FROM
                            characteristics
                          INNER JOIN attribute ON characteristics.attribute_id = attribute.attribute_id
                          WHERE
                            characteristics.category_id = ${category_id}`;
  db.query(selectStatement, (err, result) => {
    if (err) {
      sendResponse(res, err, null);
    } else {
      let characteristicsArr = [];
      result.map((item) => {
        const characteristicsObj = {
          [item.type]: {
            id: item.attribute_id,
            unit: [item.unit],
            data: [item.value],
          },
        };
        characteristicsArr.push(characteristicsObj);
      });
      const responseData = {
        max_price: maximumPrice,
        trademarks: trademarks,
        attributes: mergeDuplicateAttributes(characteristicsArr),
      };
      sendResponse(res, err, responseData);
    }
  });
};

module.exports.getProductsWithFilter = (req, res) => {
  const encodedAttributes = req.params.encoded_attributes;
  const decodedAttributes = JSON.parse(atob(encodedAttributes));
  const attributes = decodedAttributes.attributes;

  const number_of_attributes = Object.keys(attributes).length;
  var priceConditionStatement = "";
  var trademarkConditionStatement = "";
  var conditionAttributeStatement = "";
  for (let index = 0; index < number_of_attributes; index++) {
    const attributeItem = attributes[Object.keys(attributes)[index]];
    if (attributeItem.id == "price") {
      if (attributeItem.data.length > 0) {
        attributeItem.data.map((item) => {
          if (item.max == 0) {
            priceConditionStatement += `product.product_price > ${item.min} OR `;
          } else {
            priceConditionStatement += `product.product_price BETWEEN ${item.min} AND ${item.max} OR `;
          }
        });
        priceConditionStatement = priceConditionStatement.slice(0, -3);
        priceConditionStatement = "AND (" + priceConditionStatement + " ) ";
      }
      continue;
    }
    if (attributeItem.id == "trademark") {
      if (attributeItem.data.length > 0) {
        attributeItem.data.map((item) => {
          trademarkConditionStatement += `product.trademark LIKE "${item}" OR `;
        });
        trademarkConditionStatement = trademarkConditionStatement.slice(0, -3);
        trademarkConditionStatement =
          "AND (" + trademarkConditionStatement + " ) ";
      }
      continue;
    }
    attributeItem.data.map((item) => {
      conditionAttributeStatement += ` (characteristics.attribute_id = ${attributeItem.id} AND characteristics.value = "${item}") OR `;
    });
  }

  if (conditionAttributeStatement.length > 0) {
    conditionAttributeStatement = conditionAttributeStatement.slice(0, -3);
    conditionAttributeStatement = " WHERE " + conditionAttributeStatement;
  }

  const selectStatement = `
    SELECT
      *
    FROM
      ${
        conditionAttributeStatement.length > 0
          ? `
          (SELECT
            *
          FROM
            characteristics
            ${conditionAttributeStatement}
          ) AS t
            INNER JOIN characteristics_product ON t.characteristics_hash = characteristics_product.characteristics_hash
            INNER JOIN product ON characteristics_product.product_id = product.product_id`
          : "product"
      }
      WHERE 
        product.category_id = ${
          decodedAttributes.category_id
        } ${priceConditionStatement} ${trademarkConditionStatement}
  `;
  console.log(selectStatement);
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getProductByKeyword = (req, res) => {
  const encodedData = req.params.encoded_data;
  const decodedData = JSON.parse(atob(encodedData));
  const selectedPrices = decodedData.price;
  var priceConditionStatement = "";
  if (selectedPrices.length > 0) {
    selectedPrices.map((item) => {
      if (item.max == 0) {
        priceConditionStatement += `product_price > ${item.min} OR `;
      } else {
        priceConditionStatement += `product_price BETWEEN ${item.min} AND ${item.max} OR `;
      }
    });
    priceConditionStatement = priceConditionStatement.slice(0, -3);
    priceConditionStatement = "AND (" + priceConditionStatement + " )";
  }
  const selectStatement = `SELECT * from product where product_name LIKE "%${decodedData.keyword}%" ${priceConditionStatement}`;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getAllProductWithFilter = (req, res) => {
  const encodedData = req.params.encoded_data;
  const decodedData = JSON.parse(atob(encodedData));
  const selectedPrices = decodedData.price;
  var priceConditionStatement = "";
  if (selectedPrices.length > 0) {
    selectedPrices.map((item) => {
      if (item.max == 0) {
        priceConditionStatement += `product_price > ${item.min} OR `;
      } else {
        priceConditionStatement += `product_price BETWEEN ${item.min} AND ${item.max} OR `;
      }
    });
    priceConditionStatement = priceConditionStatement.slice(0, -3);
    priceConditionStatement = "WHERE (" + priceConditionStatement + " )";
  }
  const selectStatement = `SELECT * from product ${priceConditionStatement}`;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

module.exports.getProductBySlug = (req, res) => {
  const slug = req.params.slug;

  const selectStatement = `
  SELECT
    *,
    (
    SELECT
        AVG(comments.comment_star)
    FROM
        comments
    WHERE
        comments.product_id = t.product_id
  ) AS rating,
  (
    SELECT
        COUNT(comments.comment_id)
    FROM
        comments
    WHERE
        comments.product_id = t.product_id
  ) AS comment_total
  FROM
    product AS t
  WHERE
    t.product_slug = "${slug}"`;

  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result[0]);
  });
};

module.exports.getProductsWithTotal = (req, res) => {
  const selectStatement = `
  SELECT
    *,
    SUM(total) AS product_total
  FROM
    product
  INNER JOIN characteristics_product ON characteristics_product.product_id = product.product_id
  INNER JOIN category ON category.category_id = product.category_id
  GROUP BY
    product.product_id
  `;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};
module.exports.getTopsaleProduct = (req, res) => {
  const { data } = req.body;
  const selectStatement = `
  SELECT
    orderdetail.product_name,
    SUM(orderdetail.quantity) AS sold
  FROM
    orderdetail
  WHERE
    (
        orderdetail.created_at >= "${data.start}" AND orderdetail.created_at <= "${data.end}"
    )
  GROUP BY
    orderdetail.product_id
  ORDER BY
    sold
  DESC
  LIMIT 10`;
  db.query(selectStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};

//UPDATE
module.exports.update = (req, res) => {
  const { data } = req.body;

  const updateData = [
    data.product_name,
    data.trademark,
    slugify(data.product_name),
    data.product_description,
    data.product_price,
    data.product_discount,
    data.product_image,
    data.image_description1,
    data.image_description2,
    data.category_id,
    getCurrentDateTime(),
    data.product_id,
  ];

  const updateStatement = `
    UPDATE product
    SET 
      product_name = ?,
      trademark = ?,
      product_slug = ?,
      product_description = ?,
      product_price = ?,
      product_discount = ?,
      product_image = ?,
      image_description1 = ?,
      image_description2 = ?,
      category_id = ?,
      update_at = ?
    WHERE product_id = ?
  `;

  db.query(updateStatement, updateData, (err, result) => {
    sendResponse(res, err, result);
  });
};

//DELETE
module.exports.delete = (req, res) => {
  const { id } = req.body;
  const deleteStatement = `DELETE FROM product WHERE product_id = "${id}"`;
  db.query(deleteStatement, (err, result) => {
    sendResponse(res, err, result);
  });
};
