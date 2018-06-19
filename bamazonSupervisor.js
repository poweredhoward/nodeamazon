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
                "View Product Sales by Department",
                "Create New Department",
                "Exit"
            ],
            name: "choice"
        }
    ]).then( function(answer){
        var choice = answer.choice;
        switch (choice){
            case "View Product Sales by Department": 
                deptSales();
                break;
            case "Create New Department":
                newDept();
                break;
            case "Exit":
                connection.end();
                break;
        }
    })
}

function newDept(){
    inquirer.prompt([
        {
            type: "input",
            message: "Department name?",
            name: "name"
        },
        {
            type: "input",
            message: "Overhead costs?",
            name: "cost"
        }
    ]).then( answer =>{
        connection.query(
            "INSERT INTO departments SET department_name = ?, over_head_costs = ?",
            [answer.name, answer.cost],
            (err, data) =>{
                if (err) throw err;
                console.log("Department added!");
                connection.query(
                    "SELECT * FROM departments",
                    (err, data) =>{
                        console.table("\nDepartments", data);
                        ask();
                    }
                )
                
            }
        )
    })

}

function deptSales(){
    connection.query(
        "SELECT department_id, departments.department_name, SUM(over_head_costs) AS 'Overhead\ Costs',\
        SUM(products.products_sales) AS 'Product Sales',\
        SUM(products.products_sales - departments.over_head_costs) AS 'Total Profit'\
        from departments right join products on products.department_name = departments.department_name\
        GROUP BY products.department_name",
        (err, data) =>{
            if (err) throw err;
            console.table("\nProduct Sales by Department", data);
            ask();
        }
    )
}