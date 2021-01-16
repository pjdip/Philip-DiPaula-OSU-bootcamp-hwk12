/* Adding stuff to departments */
INSERT INTO departments (name)
VALUES ("Sales");

INSERT INTO departments (name)
VALUES ("Engineering");

INSERT INTO departments (name)
VALUES ("Finance");

INSERT INTO departments (name)
VALUES ("Legal");

/* Adding stuff to roles */
INSERT INTO roles (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1);

INSERT INTO roles (title, salary, department_id)
VALUES ("Salesperson", 80000, 1);

INSERT INTO roles (title, salary, department_id)
VALUES ("Lead Engineer", 150000, 2);

INSERT INTO roles (title, salary, department_id)
VALUES ("Software Engineer", 120000, 2);

INSERT INTO roles (title, salary, department_id)
VALUES ("Accountant", 125000, 3);

INSERT INTO roles (title, salary, department_id)
VALUES ("Legal Team Lead", 250000, 4);

INSERT INTO roles (title, salary, department_id)
VALUES ("Lawyer", 190000, 4);

/* Adding stuff to employees */
INSERT INTO employees (first_name, last_name, role_id)
VALUES ("John", "Doe", 1);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Mike", "Chan", 2, 1);

INSERT INTO employees (first_name, last_name, role_id)
VALUES ("Ashley", "Rodriguez", 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Kevin", "Tupik", 4, 3);

INSERT INTO employees (first_name, last_name, role_id)
VALUES ("Malia", "Brown", 5);

INSERT INTO employees (first_name, last_name, role_id)
VALUES ("Sarah", "Lourd", 6);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Tom", "Allen", 7, 6);