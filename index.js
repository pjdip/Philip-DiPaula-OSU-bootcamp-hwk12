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
    "View Employees",
    "Add Employee",
    "Remove Employee",
    "Update Employee Role",
    "Update Employee Manager",
    "View All Roles",
    "Add Role",
    "Remove Role",
    "View All Departments",
    "Add Department",
    "Remove Department",
    "View Department Budgets",
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
                case "View Employees":
                    viewEmployees();
                    break;
                case "Add Employee":
                    createEmployee();
                    break;
                case "Remove Employee":
                    deleteEmployee();
                    break;
                case "View All Roles":
                    readRoles();
                    break;
                case "Add Role":
                    createRole();
                    break;
                case "Remove Role":
                    deleteRole();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "Update Employee Manager":
                    updateEmployeeManager();
                    break;
                case "View All Departments":
                    readDepartments();
                    break;
                case "View Department Budgets":
                    readEmployeesBy("View By Department", true);
                    break;
                case "Add Department":
                    createDepartment();
                    break;
                case "Remove Department":
                    deleteDepartment();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

const createEmployee = () => {
    let managerList = ["No Manager"];
    let managerId = null;
    let roleList = [];
    let roleId;
    let query1 = "SELECT id, CONCAT (first_name, ' ', last_name) AS manager FROM employees WHERE manager_id IS NULL";
    let query2 = "SELECT id, title FROM roles";
    connection.query(query1, (err, result1) => {
        if (err) throw err;
        console.log(result1);
        result1.forEach(entry => {
            managerList.push(entry.manager);
        });
        connection.query(query2, (err, result2) => {
            if (err) throw err;
            result2.forEach(role => {
                roleList.push(role.title);
            });
            console.log(result2);
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

                    result2.forEach(role => {
                        if (answer.chosenRole === role.title) {
                            roleId = role.id;
                        }
                    });

                    result1.forEach(entry => {
                        if (answer.chosenManager === entry.manager) {
                            managerId = entry.id;
                        }
                    });

                    let sqlData;

                    if (managerId === null) {
                        sqlData = {
                            first_name: answer.first,
                            last_name: answer.last,
                            role_id: roleId
                        };
                    } else {
                        sqlData = {
                            first_name: answer.first,
                            last_name: answer.last,
                            role_id: roleId,
                            manager_id: managerId
                        };
                    }

                    let query3 = `INSERT INTO employees SET ?`;
                    connection.query(
                        query3,
                        sqlData,
                        (err, res) => {
                            if (err) throw err;
                            console.log(res.affectedRows + " Employees added!\n");
                            mainSelection();
                        }
                    );
                });
        });
    });
}

// Moving some options off the main selection to make it less crowded
const viewEmployees = () => {

    let viewOptions = ["View All", "View By Department", "View By Role", "View By Manager"];
    inquirer
        .prompt({
            name: "viewMethod",
            type: "list",
            message: "What sorting method would you like to view employees by? ",
            choices: viewOptions
        }).then(answer => {
            readEmployeesBy(answer.viewMethod, false);
        });
}

const readEmployeesBy = (filter, budget) => {
    let query1;
    switch (filter) {
        case "View By Department":
            query1 = "SELECT * FROM departments";
            connection.query(query1, (err, result) => {
                if (err) throw err;
                inquirer
                    .prompt({
                        name: "dept",
                        type: "list",
                        message: "Please choose the department who's employees you wish to view: ",
                        choices: result
                    }).then(answer => {
                        result.forEach(res => {
                            if (answer.dept === res.name) {
                                let query2 = `
                                SELECT emp1.id, emp1.first_name, emp1.last_name, title, name AS department, salary, CONCAT (emp2.first_name, ' ', emp2.last_name) AS manager
                                FROM employees emp1
                            
                                LEFT JOIN employees emp2
                                    ON emp1.manager_id = emp2.id
                                INNER JOIN roles
                                    ON emp1.role_id = roles.id
                                INNER JOIN departments
                                    ON roles.department_id = departments.id
                                WHERE ?`;
                                connection.query(
                                    query2,
                                    { name: answer.dept },
                                    (err, result1) => {
                                        if (err) throw err;
                                        if (!budget) {
                                            console.table(result1);
                                            mainSelection();
                                        } else if (budget) {
                                            let deptBudget = 0;
                                            result1.forEach(employee => {
                                                deptBudget += employee.salary;
                                            });
                                            console.log(`\nThe budget for the ${answer.dept} department is $${deptBudget}\n`);
                                            mainSelection();
                                        }
                                    }
                                );
                            }                            
                        });
                    });
            });
            break;
        case "View By Role":
            let titleList = [];
            query1 = "SELECT * FROM roles";
            connection.query(query1, (err, result) => {
                if (err) throw err;
                result.forEach(res => {
                    titleList.push(res.title);
                });
                inquirer
                    .prompt({
                        name: "rol",
                        type: "list",
                        message: "Please choose the role who's employees you wish to view: ",
                        choices: titleList
                    }).then(answer => {
                        result.forEach(res => {
                            if (answer.rol === res.title) {
                                let query2 = `
                                SELECT emp1.id, emp1.first_name, emp1.last_name, title, name AS department, salary, CONCAT (emp2.first_name, ' ', emp2.last_name) AS manager
                                FROM employees emp1
                            
                                LEFT JOIN employees emp2
                                    ON emp1.manager_id = emp2.id
                                INNER JOIN roles
                                    ON emp1.role_id = roles.id
                                INNER JOIN departments
                                    ON roles.department_id = departments.id
                                WHERE ?`;
                                connection.query(
                                    query2,
                                    { title: answer.rol },
                                    (err, result1) => {
                                        if (err) throw err;
                                        console.table(result1);
                                        mainSelection();
                                    }
                                );
                            }                            
                        });
                    });
            });
            break;
        case "View By Manager":
            let managerList = [];
            query1 = `
            SELECT
                id, CONCAT (first_name, ' ', last_name) as manager
            FROM employees
            WHERE manager_id IS NULL
            `;
            connection.query(query1, (err, result) => {
                if (err) throw err;
                result.forEach(res => {
                    managerList.push(res.manager);
                });
                inquirer
                    .prompt({
                        name: "manager",
                        type: "list",
                        message: "Please choose the manager who's employees you wish to view: ",
                        choices: managerList
                    }).then(answer => {
                        result.forEach(res => {
                            if (answer.manager === res.manager) {
                                const managerName = answer.manager.split(" ");
                                let query2 = `
                                SELECT emp1.id, emp1.first_name, emp1.last_name, title, name AS department, salary, CONCAT (emp2.first_name, ' ', emp2.last_name) AS manager
                                FROM employees emp1
                            
                                LEFT JOIN employees emp2
                                    ON emp1.manager_id = emp2.id
                                INNER JOIN roles
                                    ON emp1.role_id = roles.id
                                INNER JOIN departments
                                    ON roles.department_id = departments.id
                                WHERE ? and ?`;
                                connection.query(
                                    query2,
                                    [{
                                        "emp2.first_name": managerName[0]
                                    },
                                    {
                                        "emp2.last_name": managerName[1]
                                    }],
                                    (err, result1) => {
                                        if (err) throw err;
                                        console.table(result1);
                                        mainSelection();
                                    }
                                );
                            }                            
                        });
                    });
            });
            break;
        default:
            query1 = `
            SELECT emp1.id, emp1.first_name, emp1.last_name, title, name AS department, salary, CONCAT (emp2.first_name, ' ', emp2.last_name) AS manager
            FROM employees emp1
        
            LEFT JOIN employees emp2
                ON emp1.manager_id = emp2.id
            INNER JOIN roles
                ON emp1.role_id = roles.id
            INNER JOIN departments
                ON roles.department_id = departments.id`;
            
            connection.query(query1, (err, result) => {
                if (err) throw err;
                console.table(result);
                mainSelection();
            });
            break;
    }
}

const updateEmployeeRole = () => {
    let query3 = "Select id, CONCAT (first_name, ' ', last_name) AS name FROM employees";
    let employeeList = [];
    let employeeId;
    connection.query(query3, (err, result3) => {
        if (err) throw err;

        result3.forEach(employE => {
            employeeList.push(employE.name);
        });

        inquirer
            .prompt({
                name: "empName",
                type: "list",
                message: "Please choose the employee you wish to edit: ",
                choices: employeeList
            }).then(answer1 => {

                result3.forEach(empl => {
                    if (answer1.empName === empl.name) {
                        employeeId = empl.id;
                    }
                });

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
                            message: "Please choose the new title for this employee: ",
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
                                    id: employeeId
                                }],
                                (err, res) => {
                                    if (err) throw err;
                                    console.log(res.affectedRows + " Employee Updated!\n");
                                    mainSelection();
                                }
                            );
                        });
                });
            });
    });
}

const updateEmployeeManager = () => {
    let query3 = "Select id, CONCAT (first_name, ' ', last_name) AS name FROM employees";
    let employeeList = [];
    let employeeId;
    connection.query(query3, (err, result3) => {
        if (err) throw err;

        result3.forEach(employE => {
            employeeList.push(employE.name);
        });

        inquirer
            .prompt({
                name: "empName",
                type: "list",
                message: "Please choose the employee you wish to edit: ",
                choices: employeeList
            }).then(answer1 => {

                result3.forEach(empl => {
                    if (answer1.empName === empl.name) {
                        employeeId = empl.id;
                    }
                });
                let managerId;
                let managerList = [];
                query1 = `
                SELECT
                    id, CONCAT (first_name, ' ', last_name) as manager
                FROM employees
                WHERE manager_id IS NULL
                `;
                connection.query(query1, (err, result) => {
                    if (err) throw err;
                    result.forEach(res => {
                        managerList.push(res.manager);
                    });
                    inquirer
                        .prompt({
                            name: "manager",
                            type: "list",
                            message: "Please choose the manager for this employee: ",
                            choices: managerList
                        }).then(answer => {
                            result.forEach(res => {
                                if (answer.manager === res.manager) {
                                    managerId = res.id;
                                }
                            });

                            let query2 = "UPDATE employees SET ? WHERE ?";
                            connection.query(
                                query2,
                                [{
                                    manager_id: managerId
                                },
                                {
                                    id: employeeId
                                }],
                                (err, res) => {
                                    if (err) throw err;
                                    console.log(res.affectedRows + " Employee Updated!\n");
                                    mainSelection();
                                }
                            );
                        });
                });
            });
    });
}

const deleteEmployee = () => {
    let query1 = "Select id, CONCAT (first_name, ' ', last_name) AS name FROM employees";
    let employeeList = [];
    let employeeId;
    connection.query(query1, (err, result1) => {
        if (err) throw err;
        result1.forEach(employE => {
            employeeList.push(employE.name);
        });
        inquirer
            .prompt({
                name: "remove",
                type: "list",
                message: "Please choose the employee you wish to remove: ",
                choices: employeeList
            }).then(answer => {
                result1.forEach(res => {
                    if (answer.remove === res.name) {
                        employeeId = res.id;
                    } 
                });
                connection.query(
                    "DELETE FROM employees WHERE ?",
                    {
                        id: employeeId
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(res.affectedRows + " employees removed!\n");
                        mainSelection();
                    }
                );
            });
    });
}

/* async function retrieveDepartments() {
    let query1 = "SELECT * FROM departments";
    let res = await connection.query(query1, (err, result) => {
        if (err) throw err;
        return result;
    });
    return res;
} */

const createRole = () => {
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
                        console.log(res.affectedRows + " Role added!\n");
                        mainSelection();
                    }
                );
            });
    });
}

const readRoles = () => {
    console.log("Displaying all Roles...\n");
    let query1 = "SELECT roles.id, title, salary, name AS department FROM roles INNER JOIN departments ON roles.department_id = departments.id";
    connection.query(query1, (err, result) => {
        if (err) throw err;
        console.table(result);
        mainSelection();
    });
}

const deleteRole = () => {
    inquirer
        .prompt(
        {
            name: "removalMethod",
            type: "list",
            message: "Would you like to remove roles by name or id? ",
            choices: ["id", "title"]
        }).then(answers => {
            if (answers.removalMethod === "id") {
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
            } else if (answers.removalMethod === "title") {
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

const createDepartment = () => {
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
                        createDepartment();
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
                            mainSelection();
                        }
                    );
                }
            });
        });
}

const readDepartments = () => {
    console.log("Displaying all Departments...\n");
    let query1 = "SELECT * FROM departments";
    connection.query(query1, (err, result) => {
        if (err) throw err;
        console.table(result);
        mainSelection();
    });
}

const deleteDepartment = () => {
    inquirer
        .prompt(
        {
            name: "removalMethod",
            type: "list",
            message: "Would you like to remove departments by name or id? ",
            choices: ["id", "name"]
        }).then(answers => {
            if (answers.removalMethod === "id") {
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
            } else if (answers.removalMethod === "name") {
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