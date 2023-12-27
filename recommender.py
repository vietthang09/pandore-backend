import mysql.connector
import numpy as np
from flask import Flask, jsonify, request, json
import pandas as pd
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
db = mysql.connector.connect(
    user = 'root',
    password = '',
    host = 'localhost',
    database = 'pandore'
)

sql_product = 'SELECT * FROM `product`'
sql_wishlist = 'SELECT * FROM `wishlist`'
sql_user_rating = 'SELECT `user_id`, `product_id`, AVG(`comment_star`) AS rating FROM `comments` GROUP BY `user_id`, `product_id`'

mycursor_product = db.cursor()
mycursor_product.execute(sql_product)
result_product = mycursor_product.fetchall()


mycursor_wishlist = db.cursor()
mycursor_wishlist.execute(sql_wishlist)
result_wishlist = mycursor_wishlist.fetchall()

mycursor_user_rating = db.cursor()
mycursor_user_rating.execute(sql_user_rating)
result_user_rating = mycursor_user_rating.fetchall()

    
product_list = []
alluser_rating = []
wishlist = []

for x in result_wishlist:
    wishlist.append({
        "wishlist_id": x[0],
        "user_id": x[1],
        "product_id": x[2]
    })

for x in result_product:
    product_list.append({
        "product_id": x[0],
        "product_name": x[1],
        "trademark": x[2],
        "product_slug": x[3],
        "product_description": x[4],
        "product_price": x[5],
        "product_discount": x[6],
        "product_image": x[7], 
        "image_description1": x[8], 
        "image_description2": x[9], 
        "category_id": x[10], 
        "status": x[11], 
        "create_at": x[12], 
    })

for x in result_user_rating:
    alluser_rating.append({
        "user_id": x[0],
        "product_id": x[1],
        "rating": x[2]
    })

@app.route("/recommender/<user_id>", methods=["GET"])
def Predict(user_id):
    order = [] 
    rating = []
    top_rating = []
    user_recommender_order = []

    sql_order =  """SELECT `user_id`, `product_id`, SUM(`quantity`) AS quantity 
                    FROM orders 
                    INNER JOIN orderdetail ON orderdetail.order_id = orders.order_id 
                    GROUP BY `user_id`, `product_id`"""
    mycursor_order = db.cursor()
    mycursor_order.execute(sql_order)
    result_order = mycursor_order.fetchall()

    sql_rating = 'SELECT `user_id`, `product_id`, AVG(`comment_star`) AS rating FROM `comments` WHERE `user_id` = %s GROUP BY `product_id`'
    mycursor_rating = db.cursor()
    mycursor_rating.execute(sql_rating, [user_id])
    result_rating = mycursor_rating.fetchall()

    sql_top_rating = """SELECT 
                            comments.product_id, 
                            product.product_name, 
                            product.product_slug, 
                            product.product_price, 
                            product.product_discount, 
                            product.product_image,
                            AVG(`comment_star`) AS rating 
                        FROM `comments` 
                        INNER JOIN product ON comments.product_id = product.product_id 
                        GROUP BY comments.product_id 
                        ORDER BY rating DESC
                        LIMIT 6"""
    mycursor_toprating = db.cursor()
    mycursor_toprating.execute(sql_top_rating)
    result_toprating = mycursor_toprating.fetchall()

    for x in result_toprating:
        top_rating.append({
            "product_id": x[0],
            "product_name": x[1],
            "product_slug": x[2],
            "product_price": x[3],
            "product_discount": x[4],
            "product_image": x[5],
            "rating": x[6]
        })

    for x in result_rating:
        rating.append({
            "user_id": x[0],
            "product_id": x[1],
            "rating": x[2]
        })

    for x in result_order:
        order.append({
            "user_id": x[0],
            "product_id": x[1],
            "quantity": x[2]
        })


    if not rating:
        return top_rating
    else:
        user_rating = pd.DataFrame(alluser_rating)
        user_rating.head()

        user_score = user_rating.pivot_table(index = ['product_id'], columns = ['user_id'], values = 'rating')
        user_score.head()
        print(user_score)

        user_score = user_score.fillna(0)
        user_score = user_score.replace(np.nan, 0)
        print(user_score)

        course_similarity_df = user_score.corr(method='pearson')
        course_similarity_df.head(100)
        print(course_similarity_df.head(100))

        similar_score = course_similarity_df[int(user_id)].sort_values(ascending=False)
        print(similar_score)

        user_recommender = similar_score.to_json(orient="split")
        data = json.loads(user_recommender)
        # print(user_recommender)

        sql_user_recommender_order = """SELECT
                                            orders.user_id,
                                            orderdetail.product_id,
                                            product.product_name,
                                            product.product_slug,
                                            product.product_price,
                                            product.product_discount,
                                            product.product_image
                                        FROM orderdetail 
                                        INNER JOIN orders ON orders.order_id = orderdetail.order_id
                                        INNER JOIN product ON orderdetail.product_id = product.product_id
                                        WHERE orders.user_id = %s 
                                        GROUP BY orderdetail.product_id
                                        LIMIT 6"""
        mycursor_user_recommender_order = db.cursor()
        mycursor_user_recommender_order.execute(sql_user_recommender_order, [data['index'][1]])
        result_mycursor_user_recommender_order = mycursor_user_recommender_order.fetchall()
        for x in result_mycursor_user_recommender_order:
            user_recommender_order.append({
                "product_id": x[1],
                "product_name": x[2],
                "product_slug": x[3],
                "product_price": x[4],
                "product_discount": x[5],
                "product_image": x[6]
            })

        print([data['index'][1]])
        # print([data['index'][2]])
        if not user_recommender_order:
            user_recommender_order_2 = []

            mycursor_user_recommender_order = db.cursor()
            mycursor_user_recommender_order.execute(sql_user_recommender_order, [data['index'][2]])
            result_mycursor_user_recommender_order = mycursor_user_recommender_order.fetchall()
            for x in result_mycursor_user_recommender_order:
                user_recommender_order_2.append({
                    "product_id": x[1],
                    "product_name": x[2],
                    "product_slug": x[3],
                    "product_price": x[4],
                    "product_discount": x[5],
                    "product_image": x[6]
                })
            if not user_recommender_order_2:
                return top_rating
            else:
                return user_recommender_order_2
        else:
            print(user_recommender_order)
            return user_recommender_order

if __name__ == "__main__":
    app.run(host="localhost", port=5001, debug=True)