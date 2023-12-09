const db = require("../db");
var slugify = require("slugify");
const {
  sendResponse,
  mergeDuplicateAttributes,
  getCurrentDateTime,
} = require("../util/helper");

module.exports.getAllSale = (req, res) => {
    const selectStatement = "SELECT * FROM `voucher` ORDER BY `date_start` DESC";
    db.query(selectStatement, (err, result) => {
      sendResponse(res, err, result);
    });
};

module.exports.updateTimeSale = (req,res)=>{
    const {id,date_start,expired} = req.body;
    const sql = "UPDATE `voucher` SET date_start = ?,expired = ? WHERE id = ?";
    db.query(sql,[date_start,expired,id],(err,rows)=>{
        if(err){
            return res.json({msg:err});
        }else{
            return res.json({msg:"Success"})
        }
    })
}

module.exports.updateQuanitySale = (req,res)=>{
    const {id,quantity} = req.body;
    console.log(id,quantity)
    const sql ="UPDATE voucher SET quantity = ? WHERE id = ?";
    db.query(sql,[quantity,id],(err,rows)=>{
        if(err){
            return res.json({msg:err});
        }else{
            return res.json({msg:"Success"})
        }
    })
}

module.exports.deleteSale = (req,res)=>{
    const {id} = req.body;
    const sql = "DELETE FROM voucher WHERE id = ?"
    db.query(sql,[id],(err,result)=>{
        if(err){
            console.log(err)
            return res.json({msg:err});
        }else{
            return res.json({msg:"Success"})
        }
    })
}

module.exports.addPromotion = (req,res)=>{
    const {name_event_sale,code_sale,discount,quantity,date_start,expired} = req.body.data;
    const sql = "INSERT INTO voucher(name_event_sale,code_sale,discount,quantity,used,date_start,expired) VALUES (?,?,?,?,?,?,?)";
    db.query(sql,[name_event_sale,code_sale.toUpperCase(),discount,quantity,0,date_start,expired],(err,rows)=>{
        if(err){
            return res.json({msg:err});
        }else{
            return res.json({msg:"Success"})
        }
    })
}