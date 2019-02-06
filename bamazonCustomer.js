var inquirer = require("inquirer");
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
  runSale();
});

function runSale() {
  console.log("\nHello check out our products!\n");
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
    customerBuy();
  });
}

function customerBuy() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "id",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < res.length; i++) {
              choiceArray.push(res[i].product_name);
            }
            return choiceArray;
          },
          message: "Which Item Would You Like to Buy?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to purchase?"
        }
      ])
      .then(function(answer) {
        var chosenItem;
        for (var i = 0; i < res.length; i++) {
          if (res[i].product_name === answer.id) {
            chosenItem = res[i];
          }
        }
        if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
          connection.query(
            "UPDATE products SET ? WHERE?",
            [
              {
                stock_quantity: chosenItem.stock_quantity - answer.quantity,
                product_sales: answer.quantity * chosenItem.price
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              var purchaseTotal = answer.quantity * chosenItem.price;
              console.log(
                "\nThank you for your purchase!\n" +
                  "Your purchase total was: $" +
                  purchaseTotal
              );

              runSale();
            }
          );
        } else {
          console.log("\nWe don't have that many of this product?\n");
          runSale();
        }
      });
  });
}
