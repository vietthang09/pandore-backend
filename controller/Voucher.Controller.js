const db = require("../db");

module.exports.getVoucherByCode = (req, res) => {
  const voucherCode = req.params.code;

  const selectStatement = `SELECT
            *
        FROM
            voucher
        WHERE
            code_sale = '${voucherCode}'`;

  db.query(selectStatement, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      /*
            status:    
                not found: 0
                not started: 1
                ended: 2
                ready: 3
                code is out: 4

        */

      var status = 0;
      var foundVoucher;
      if (result.length > 0) {
        var date = new Date();
        var current_date =
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate();
        var current_time =
          date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var date_time = current_date + " " + current_time;
        foundVoucher = result[0];
        date_time = new Date(date_time).toISOString();
        const date_start = new Date(foundVoucher.date_start).toISOString();
        const expired = new Date(foundVoucher.expired).toISOString();
        if (date_start < date_time && expired > date_time) {
          status = 3;
          if (foundVoucher.quantity == foundVoucher.used) {
            status = 4;
          }
        } else if (date_start > date_time && expired > date_time) {
          status = 1;
        } else if (date_start < date_time && expired < date_time) {
          if (foundVoucher.quantity == foundVoucher.used) {
            status = 4;
          } else {
            status = 2;
          }
        }
      }
      const responseData = {
        status: status,
        voucher_infor: foundVoucher,
      };
      res.send(responseData);
    }
  });
};
