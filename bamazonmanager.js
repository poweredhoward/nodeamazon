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
        //managerView();
        ask();
    })
}

function ask(){
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Exit"
            ],
            name: "choice"
        }
    ]).then( function(answer){
        var choice = answer.choice;
        switch (choice){
            case "View Products for Sale": 
                managerView();
                break;
            case "View Low Inventory":
                lowInventory();
                break;
            case "Add to Inventory":
                //addToInventory();
                managerView(addToInventory);
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit":
                connection.end();
                break;
        }
    })
}

function addNewProduct(){
    inquirer.prompt([
        {
            type: "input",
            message: "Product Name",
            name: "name"
        },
        {
            type: "input",
            message: "Department",
            name: "dept"
        },
        {
            type: "input",
            message: "Price per unit",
            name: "price",
        },
        {
            type: "input",
            message: "Initial Inventory",
            name: "quantity"
        }
    ]).then( function(answer){
        var name = answer.name;
        var dept = answer.dept;
        var price = answer.price;
        var quantity = answer.quantity;

        connection.query(
            "INSERT INTO products(product_name, department_name, price, stock_quantity, products_sales) values\
            (?, ?, ?, ?, ?)",
            [name, dept, price, quantity, 0],
            function(err, data){
                if (err){
                    console.log("Bad Query, try again");
                    ask();
                }
                managerView();
            }
        )
    })
}

function addToInventory(){
    //managerView();
    inquirer.prompt([
        {
            type: "input",
            message: "What item do you want more of? (id)",
            name: "id"
        },
        {
            type: "input",
            message: "How many do you want to add to the stock quantity",
            name: "quantity"
        }
    ]).then(function(answer){
        var id = answer.id;
        var quantity = answer.quantity;
        connection.query(
            "UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?",
            [quantity, id],
            function(err, data){
                if (err){
                    console.log("Bad Query, try again");
                    ask();
                }
                console.log("Stock added!");
                //managerView();
                ask();
            }
        )
    })
}

function lowInventory(){
    connection.query(
        "SELECT * FROM products WHERE stock_quantity < 5",
        function(err, data){
            if (err){
                console.log("Bad Query, try again");
                ask();
            }
            console.table("\nItems with under 5 left", data);
            //managerView();
            ask();
        }
    )
}

//Show table in nice format
function managerView(cb){
    connection.query(
        "SELECT item_id as 'Item Number', product_name AS 'Product Name',\
         department_name as 'Department', price as 'Price', products_sales AS 'Product Sales', stock_quantity AS 'Number in Stock' FROM products",
        function(err, data){
            if (err) throw data;
            console.table("\nProducts available", data);
            if(cb !== undefined){
                cb();
            }
            else{
                ask();
            }
            
            //ask();
            //connection.end();
        }
    );

    
}