var inquierer = require("inquirer");
var mysql = require("mysql");

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
  runManager();
});

function runManager() {
  inquierer
    .prompt([
      {
        name: "menu",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product",
          "End"
        ]
      }
    ])
    .then(function(answer) {
      switch (answer.menu) {
        case "View Products for Sale":
          prodForSale();
          break;
        case "View Low Inventory":
          lowInventory();
          break;
        case "Add to Inventory":
          addInventory();
          break;
        case "Add New Product":
          addProduct();
          break;
        case "End":
          end();
          break;
      }
    });
}

function prodForSale() {
  console.log("\nThese are the products currently for sale!\n");
  var query = "SELECT * FROM products";
  connection.query(query, function(err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log("Product ID: " + res[i].id);
      console.log(
        "Item: " +
          res[i].product_name +
          "\nDepartment: " +
          res[i].department_name +
          "\nPrice: " +
          res[i].price +
          "\nQuantity in stock: " +
          res[i].stock_quantity +
          "\n----------------\n"
      );
    }
    runManager();
  });
}

function lowInventory() {
  console.log("\nThese are items you're low on!\n");
  var query = "SELECT * FROM products WHERE stock_quantity  <5";
  connection.query(query, function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log(
        "\nProduct ID: " +
          res[i].id +
          "\nItem: " +
          res[i].product_name +
          "\nDepartment: " +
          res[i].department_name +
          "\nPrice: " +
          res[i].price +
          "\nQuantity in stock: " +
          res[i].stock_quantity +
          "\n----------------"
      );
    }
    console.log("\n");
    runManager();
  });
}

function addInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    inquierer
      .prompt([
        {
          name: "product",
          type: "rawlist",
          message: "Which item are adding inventory to?",
          choices: function() {
            var choices = [];
            for (var i = 0; i < res.length; i++) {
              choices.push(res[i].product_name);
            }
            return choices;
          }
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to add?"
        }
      ])
      .then(function(answer) {
        var chosenItem;
        for (var i = 0; i < res.length; i++) {
          if (res[i].product_name === answer.product) {
            chosenItem = res[i];
          }
        }
        connection.query("UPDATE products SET ? WHERE?", [
          {
            stock_quantity:
              parseInt(chosenItem.stock_quantity) + parseInt(answer.quantity)
          },
          { id: chosenItem.id }
        ]);
        console.log(
          "\n------------------\n" +
            "\n" +
            answer.quantity +
            " added to " +
            chosenItem.product_name +
            "\n"
        );
        runManager();
      });
  });
}

function addProduct() {
  inquierer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What item would you like to add to the inventory?"
      },
      {
        name: "department",
        type: "input",
        message: "What department is this in?"
      },
      {
        name: "price",
        type: "input",
        message: "What is this item's cost?"
      },
      {
        name: "stock",
        type: "input",
        message: "How many items are in stock?"
      }
    ])
    .then(function(answer) {
      connection.query("INSERT INTO products SET ?", {
        product_name: answer.item,
        department_name: answer.department,
        price: answer.price,
        stock_quantity: answer.stock
      });
      console.log("\nYour item has been added!\n");
      runManager();
    });
}
function end() {
  console.log("\n");
  console.log("Bye!\n");
  connection.end();
}
