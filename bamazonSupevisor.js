var inquirer = require("inquirer");
var mysql = require("mysql");
var cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected");
});

function runSupervisor() {
  inquirer
    .prompt([
      {
        name: "menu",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View Product Sales by Department",
          "Create New Department",
          "End"
        ]
      }
    ])
    .then(function(answer) {
      switch (answer.menu) {
        case "View Product Sales by Department":
          salesDept();
          break;
        case "Create New Department":
          newDept();
          break;
        case "End":
          end();
          break;
      }
    });
}

function salesDept() {
  var query =
    "SELECT d.department_id, d.department_name, d.over_head, sum(p.product_sales) as product_sale, sum(p.product_sales-d.over_head) as total_profit FROM products p INNER JOIN departments d on p.department_name = d.department_name GROUP BY d.department_id, d.department_name, d. over_head";
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    runSupervisor();
  });
}

function newDept() {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "What is the new department name?"
      },
      {
        name: "overhead",
        type: "input",
        message: "What is the department overhead?"
      }
    ])
    .then(function(answer) {
      connection.query("INSERT INTO departments SET ?", {
        department_name: answer.department,
        over_head: answer.overhead
      });
      console.log("\nThe new department has been created!\n");
      runSupervisor();
    });
}

function end() {
  console.log("\n");
  console.log("Bye!\n");
  connection.end();
}

runSupervisor();
