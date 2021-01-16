// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
const cTable = require('console.table');

// Define Connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Z9PpV$u!Rc3G',
    database: 'employee_db'
});

const query = util.promisify(connection.query);

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
    "Add Role",
    "Remove Role",
    "Update Employee Role",
    "Update Employee Manager",
    "View All Departments",
    "Add Department",
    "Remove Department",
    "Exit"
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
                    viewBy("all");
                    break;
                case "View All Employees by Department":
                    viewBy("Department");
                    break;
                case "View All Employees by Role":
                    viewBy("Role");
                    break;
                case "View All Employees by Manager":
                    viewBy("Manager");
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Remove Employee":
                    removeEmployee();
                    break;
                case "View All Roles":
                    //done
                    viewRoles();
                    break;
                case "Add Role":
                    //done
                    addRole();
                    break;
                case "Remove Role":
                    //done
                    removeRole();
                    break;
                case "Update Employee Role":
                    updateRole();
                    break;
                case "Update Employee Manager":
                    updateManager();
                    break;
                case "View All Departments":
                    //done
                    viewDepartments();
                    break;
                case "Add Department":
                    //done
                    addDepartment();
                    break;
                case "Remove Department":
                    //done
                    removeDepartment();
                    break;
                case "Exit":
                    //done
                    connection.end();
                    break;

                default:
                    //something
            }
        });
}

const viewAll = () => {
    let query1 = `SELECT id, first_name, last_name, title, name, salary 
    FROM employees

    INNER JOIN roles
        ON employees.role_id = roles.id
    INNER JOIN departments
        ON roles.department_id = departments.id`;
    
    connection.query(query1, (err, result) => {
        if (err) throw err;
        console.table(result);
    });
}

/* async function viewBy(filter) {
    switch (filter) {
        case "Department":
            let deptOptions = await retrieveDepartments();
            console.log(retrieveDepartments());
             inquirer
                .prompt({

                })
            let query1 = "SELECT employees.id, first_name, last_name, title, name AS department, salary, "
            break;
        case "Role":

            break;
        case "Manager":

            break;
        default:
            //view all
            break;
    }
} */

const viewBy = filter => {
    switch (filter) {
        case "Department":
            let query1 = "SELECT * FROM departments";
            connection.query(query1, (err, result) => {
                if (err) throw err;
                console.log(result);
                inquirer
                    .prompt({
                        name: "dept",
                        type: "list",
                        message: "Please choose the department who's employees you wish to view: ",
                        choices: result
                    }).then(answer => {
                        if (answer.dept === result.name) {
                            let query2 = "SELECT employees.id, first_name, last_name, title, name AS department, salary, ";
                        }
                    })
            });
            mainSelection();
            break;
        case "Role":

            break;
        case "Manager":

            break;
        default:
            //view all
            break;
    }
}

const retrieveDepartments = () => {
    let query1 = "SELECT * FROM departments";
    connection.query(query1, (err, result) => {
        if (err) throw err;
        return result;
    });
}

const addEmployee = () => {
    let managerList = ["No Manager"];
    let managerId;
    let roleList = [];
    let roleId;
    let query1 = "SELECT id, first_name, last_name FROM employees WHERE manager_id IS NULL";
    let query2 = "SELECT * FROM roles";
    connection.query(query1, (err, result1) => {
        if (err) throw err;
        result1.forEach(manager => {
            managerList.push(manager.first_name + " " + manager.last_name);
        });
        connection.query(query2, (err, result2) => {
            if (err) throw err;
            result2.forEach(role => {
                roleList.push(role.title);
            });
            inquirer
                .prompt([{
                    name: "first",
                    type: "input",
                    message: "Please enter the first name of the employee you wish to add: "
                },
                {
                    name: "last",
                    type: "input",
                    message: "Please enter the last name of the employee you wish to add: "
                },
                {
                    name: "chosenRole",
                    type: "list",
                    message: "Please choose the role for the new employee: ",
                    choices: roleList
                },
                {
                    name: "chosenManager",
                    type: "list",
                    message: "Please choose the manager for the new employee: ",
                    choices: managerList
                }]).then(answer => {
                    result1.forEach(manager => {
                        if (answer.chosenManager === manager.first_name + " " + manager.last_name) {
                            managerId = manager.id;
                        } else {
                            managerId = null;
                        }
                        console.log(managerId);
                    });
                    result2.forEach(role => {
                        if (answer.chosenRole === role.title) {
                            roleId = role.id;
                        }
                        console.log(roleId);
                    });
                    let query3 = "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?)";
                    connection.query(
                        query3,
                        {
                            first_name: answer.first,
                            last_name: answer.last,
                            role_id: roleId,
                            manager_id: managerId
                        },
                        (err, res) => {
                            if (err) throw err;
                            console.log(res.affectedRows + " Employees added!\n");
                        }
                    );
                    mainSelection();
                });
        });
    });
}

const updateRole = () => {
    inquirer
        .prompt({
            name: "empID",
            type: "input",
            message: "Please enter the id of the employee you wish to edit: "
        }).then(answer1 => {
            let roleList = [];
            let roleId;
            let query1 = "SELECT * FROM roles";
            connection.query(query1, (err, result) => {
                if (err) throw err;
                result.forEach(role => {
                    roleList.push(role.title);
                });
                inquirer
                    .prompt({
                        name: "newRole",
                        type: "list",
                        message: "Please choose the title for the role this employee now has: ",
                        choices: roleList
                    }).then(answer2 => {
                        result.forEach(role => {
                            if (answer2.newRole === role.title) {
                                roleId = role.id;
                            }
                        });
                        let query2 = "UPDATE employees SET ? WHERE ?";
                        connection.query(
                            query2,
                            [{
                                role_id: roleId
                            },
                            {
                                id: answer1.empID
                            }],
                            (err, res) => {
                                if (err) throw err;
                                console.log(res.affectedRows + " Department added!\n");
                            }
                        );
                        mainSelection();
                    });
            });
        });
}

const viewRoles = () => {
    console.log("Displaying all Roles...\n");
    let query1 = "SELECT roles.id, title, salary, name AS department FROM roles INNER JOIN departments ON roles.department_id = departments.id";
    connection.query(query1, (err, result) => {
        if (err) throw err;
        console.table(result);
        mainSelection();
    });
}

const addRole = () => {
    let deptList = [];
    let deptId;
    let query1 = "SELECT * FROM departments";
    connection.query(query1, (err, result) => {
        if (err) throw err;
        result.forEach(dept => {
            deptList.push(dept.name);
        });
        inquirer
            .prompt([{
                name: "title",
                type: "input",
                message: "Please input the title for the new role: "
            },
            {
                name: "salary",
                type: "input",
                message: "Please input the salary for the new role: "
            },
            {
                name: "deptartment",
                type: "list",
                message: "Please choose which department this role belongs to: ",
                choices: deptList
            }]).then(answer => {
                result.forEach(dept => {
                    if (answer.deptartment === dept.name) {
                        deptId = dept.id;
                    }
                });
                let query2 = "INSERT INTO roles SET ?";
                connection.query(
                    query2,
                    {
                        title: answer.title,
                        salary: answer.salary,
                        department_id: deptId
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(res.affectedRows + " Department added!\n");
                    }
                );
                mainSelection();
            });
    });
}

const removeRole = () => {
    inquirer
        .prompt(
        {
            name: "removal_method",
            type: "list",
            message: "Would you like to remove roles by name or id? ",
            choices: ["id", "title"]
        }).then(answers => {
            if (answers.removal_method === "id") {
                inquirer
                    .prompt({
                        name: "byId",
                        type: "input",
                        message: "Please input the id of the role you wish to remove: "
                    })
                    .then(answer1 => {
                        connection.query(
                            "DELETE FROM roles WHERE ?",
                            {
                                id: answer1.byId
                            },
                            (err, res) => {
                                if (err) throw err;
                                console.log(res.affectedRows + " roles removed!\n");
                                mainSelection();
                            }
                        );
                    });
            } else if (answers.removal_method === "title") {
                inquirer
                    .prompt({
                        name: "byTitle",
                        type: "input",
                        message: "Please input the title of the role you wish to remove: "
                    })
                    .then(answer2 => {
                        connection.query(
                            "DELETE FROM roles WHERE ?",
                            {
                                title: answer2.byTitle
                            },
                            (err, res) => {
                                if (err) throw err;
                                console.log(res.affectedRows + " roles removed!\n");
                                mainSelection();
                            }
                        );
                    });
            }
        });
}

const viewDepartments = () => {
    console.log("Displaying all Departments...\n");
    let query1 = "SELECT * FROM departments";
    connection.query(query1, (err, result) => {
        if (err) throw err;
        console.table(result);
        mainSelection();
    });
}

const addDepartment = () => {
    inquirer
        .prompt({
            name: "department",
            type: "input",
            message: "Please enter the name of the department you wish to add: "
        }).then(answer => {
            let newDept = false;
            let query1 = "SELECT * FROM departments";
            connection.query(query1, (err, results) => {
                if (err) throw err;
                results.forEach(result => {
                    if (answer.department === result.name) {
                        console.log("That's already a department");
                        addDepartment();
                    } else {
                        newDept = true;
                    }
                });
                if (newDept === true) {
                    let query2 = "INSERT INTO departments SET ?";
                    connection.query(
                        query2,
                        {
                            name: answer.department
                        },
                        (err, res) => {
                            if (err) throw err;
                            console.log(res.affectedRows + " Department added!\n");
                        }
                    );
                    mainSelection();
                }
            });
        });
}

const removeDepartment = () => {
    inquirer
        .prompt(
        {
            name: "removal_method",
            type: "list",
            message: "Would you like to remove departments by name or id? ",
            choices: ["id", "name"]
        }).then(answers => {
            if (answers.removal_method === "id") {
                inquirer
                    .prompt({
                        name: "byId",
                        type: "input",
                        message: "Please input the id of the department you wish to remove: "
                    })
                    .then(answer1 => {
                        connection.query(
                            "DELETE FROM departments WHERE ?",
                            {
                                id: answer1.byId
                            },
                            (err, res) => {
                                if (err) throw err;
                                console.log(res.affectedRows + " departments removed!\n");
                                mainSelection();
                            }
                        );
                    });
            } else if (answers.removal_method === "name") {
                inquirer
                    .prompt({
                        name: "byName",
                        type: "input",
                        message: "Please input the name of the department you wish to remove: "
                    })
                    .then(answer2 => {
                        connection.query(
                            "DELETE FROM departments WHERE ?",
                            {
                                name: answer2.byName
                            },
                            (err, res) => {
                                if (err) throw err;
                                console.log(res.affectedRows + " departments removed!\n");
                                mainSelection();
                            }
                        );
                    });
            }
        });
}