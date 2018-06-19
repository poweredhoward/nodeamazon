var mysql = require("mysql");
const ctable = require("console.table");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "admin",
    database: "bamazon"
});

run();

function run(){
    connection.connect(function(err){
        if (err) throw err;
        customerView();
        // ask();
    })
}

function ask(){
    inquirer.prompt([
        {
            type: "input",
            message: "What is the ID of the item you want? (Press CTRL + C to quit)",
            name: "id"  
        },
        {
            type: "input",
            message: "How many do you want?",
            name: "quantity"
        }
    ]).then( function(answer){
        var num_requested = answer.quantity;
        var id = answer.id; 
        //Get info for selected product
        connection.query(
            "SELECT * FROM products WHERE item_id=?",
            [id],
            function(err, data){
                if (err) throw err;
                var price = data[0].price;

                //Acceptable purchase
                if(data[0].stock_quantity >= num_requested){
                    var total = price * num_requested; 
                    //Update value in DB
                    connection.query(
                        "UPDATE products SET stock_quantity = stock_quantity - ?, products_sales = products_sales + ?  WHERE item_id = ?",
                        [num_requested, total, id],
                        function(err,data){
                            if (err) throw err;
                            console.log("Transaction was $" + total);
                            customerView();
                        }
                    )
                }
                else{
                    console.log("Not enough in stock, try again");
                    ask();
                }
            }
        )
    });
}

//Show table in nice format
function customerView(){
    connection.query(
        "SELECT item_id as 'Item Number', product_name AS 'Product Name',\
         department_name as 'Department', price as 'Price' FROM products",
        function(err, data){
            if (err) throw data;
            console.table("\nProducts available", data);
            ask();
            //connection.end();
        }
    )
}