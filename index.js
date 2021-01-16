// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');

// Define Connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Z9PpV$u!Rc3G',
    database: 'employee_db'
});

// Establish Connection
connection.connect(err => {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id: " + connection.threadId);
    mainSelection();
});

const selections = [
    "View All Employees",
    "View All Employees by Department",
    "View All Employees by Role",
    "View All Employees by Manager",
    "Add Employee",
    "Remove Employee",
    "Update Employee Role",
    "Update Employee Manager",
    "View All Roles"
];

const mainSelection = () => {
    inquirer
        .prompt({
            name: "main",
            type: "list",
            message: "What would you like to do?",
            choices: selections
        }).then(answer => {
            switch (answer.main) {
                case "View All Employees":
                    viewAll();
                    break;
                case "View All Employees by Department":
                    viewByDepartment();
                    break;
                case "View All Employees by Role":
                    viewByRole();
                    break;
                case "View All Employees by Manager":
                    viewByManager();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Remove Employee":
                    removeEmployee();
                    break;
                case "Update Employee Role":
                    updateRole();
                    break;
                case "Update Employee Manager":
                    updateManager();
                    break;
                case "View All Roles":
                    viewRoles();
                    break;
                default:
                    //something
            }

/*             if (answer.main === "View All Employees") {
                viewAll();
            } else if (answer.main === "View All Employees by Department") {
                viewByDepartment();
            } else if (answer.main === "View All Employees by Role") {
                viewByRole();
            } else if (answer.main === "View All Employees by Manager") {
                viewByManager();
            } else if (answer.main === "Add Employee") {
                addEmployee();
            } else if (answer.main === "Remove Employee") {
                removeEmployee();
            } else if (answer.main === "Update Employee Role") {
                updateRole();
            } else if (answer.main === "Update Employee Manager") {
                updateManager();
            } else if (answer.main === "View All Roles") {
                viewRoles();
            } */
        });
}

const continueORexit = () => {
    inquirer
        .prompt({
            name: "proceed",
            type: "list",
            message: "What would you like to do?",
            choices: ["More Database Things", "Exit"]
        }).then(answer => {
            if (answer.proceed === "Exit") {
                connection.end();
            } else {
                mainSelection();
            }
        });
}

const viewAll = () => {
    connection.query("SELECT * FROM employees", (err, results) => {
        if (err) throw err;
        console.table(result);
        continueORexit();
    });
}