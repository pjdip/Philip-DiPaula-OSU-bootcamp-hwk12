// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

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
    "View All Roles",
    "Update Employee Role",
    "Update Employee Manager",
    "View All Departments",
    "Add Department"
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
                case "View All Roles":
                    viewRoles();
                    break;
                case "Update Employee Role":
                    updateRole();
                    break;
                case "Update Employee Manager":
                    updateManager();
                    break;
                case "View All Departments":
                    viewDepartments();
                    break;
                case "Add Department":
                    addDepartment();
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
    let query = `SELECT id, first_name, last_name, title, name, salary 
    FROM employees

    INNER JOIN roles
        ON employees.role_id = roles.id
    INNER JOIN departments
        ON roles.department_id = departments.id`;
    
    connection.query(query, (err, result) => {
        if (err) throw err;
        console.table(result);
        continueORexit();
    });
}

const viewByDepartment = () => {
    inquirer
        .prompt({
            name: department,
            type: 'list',
            message: "Which department would you like to "

        })
    let query = "";
}

// change 'name' to 'department' in departments table
const viewRoles = () => {
    console.log("Selecting all Roles...\n");
    let query = "SELECT title, salary, name FROM roles INNER JOIN departments ON roles.department_id = departments.id";
    connection.query(query, (err, result) => {
        if (err) throw err;
        console.table(result);
        continueORexit();
    });
}

const viewDepartments = () => {
    console.log("Selecting all Departments...\n");
    let query = "SELECT * FROM departments";
    connection.query(query, (err, result) => {
        if (err) throw err;
        console.table(result);
        continueORexit();
    });
}