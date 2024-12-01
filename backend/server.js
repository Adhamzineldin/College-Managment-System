const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Initialize SQLite database
const db = new sqlite3.Database('./backend/users.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        // Create accounts table if it doesn't exist
        db.run(
            `CREATE TABLE IF NOT EXISTS accounts (
                email TEXT NOT NULL,
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                subjects TEXT NOT NULL, -- Store subject IDs as a JSON string
                finalGrade REAL NOT NULL -- Store final grade as a numeric value
            )`,
            (err) => {
                if (err) {
                    console.error('Error creating accounts table:', err.message);
                } else {
                    console.log('Accounts table created or already exists.');
                }
            }
        );

        // Create subjects table if it doesn't exist
        db.run(
            `CREATE TABLE IF NOT EXISTS subjects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error('Error creating subjects table:', err.message);
                } else {
                    console.log('Subjects table created or already exists.');
                }
            }
        );

        // Insert dummy subjects only if the subjects table is empty
        db.get('SELECT COUNT(*) AS count FROM subjects', (err, row) => {
            if (err) {
                console.error('Error checking subjects table:', err.message);
            } else if (row.count === 0) {
                const dummySubjects = [
                    { id: 'CS101', name: 'Computer Science Basics' },
                    { id: 'CS102', name: 'Data Structures' },
                    { id: 'MATH101', name: 'Calculus I' },
                    { id: 'PHYS101', name: 'Physics I' },
                    { id: 'BIO101', name: 'Biology' },
                    { id: 'ENG101', name: 'English Literature' }
                ];

                dummySubjects.forEach(subject => {
                    const query = `INSERT INTO subjects (id, name) VALUES (?, ?)`;
                    db.run(query, [subject.id, subject.name], (err) => {
                        if (err) {
                            console.error('Error inserting subject:', err.message);
                        } else {
                            console.log(`Subject added: ${subject.name}`);
                        }
                    });
                });
            }
        });

        // Insert default users (Admin, Lecturer, Student) only if the accounts table is empty
        db.get('SELECT COUNT(*) AS count FROM accounts', (err, row) => {
            if (err) {
                console.error('Error checking accounts table:', err.message);
            } else if (row.count === 0) {
                const users = [
                    {
                        email: 'admin@example.com',
                        id: '20230001',
                        name: 'Admin User',
                        password: 'admin123',
                        role: 'admin',
                        subjects: ['CS101', 'CS102'],
                        finalGrade: 100
                    },
                    {
                        email: 'lecturer@example.com',
                        id: '20230002',
                        name: 'Lecturer User',
                        password: 'lecturer123',
                        role: 'lecturer',
                        subjects: ['CS101', 'CS102'],
                        finalGrade: 90
                    },
                    {
                        email: 'student@example.com',
                        id: '20230003',
                        name: 'Student User',
                        password: 'student123',
                        role: 'student',
                        subjects: ['MATH101', 'PHYS101'],
                        finalGrade: 80
                    }
                ];

                // Insert users into the database
                users.forEach(user => {
                    const query = `INSERT INTO accounts (email, id, name, password, role, subjects, finalGrade) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    db.run(
                        query,
                        [user.email, user.id, user.name, user.password, user.role, JSON.stringify(user.subjects), user.finalGrade],
                        (err) => {
                            if (err) {
                                console.error('Error inserting user:', err.message);
                            } else {
                                console.log(`User ${user.role} added: ${user.name}`);
                            }
                        }
                    );
                });
            }
        });
    }
});

const generateId = () => {
    const id = Date.now().toString().slice(-8); // Get last 8 digits of the timestamp
    return id;
};




// Add user route (for testing purposes)
app.post('/api/add-user', (req, res) => {
    const { email, name, password, role, subjects } = req.body;

    let finalGrade = req.body.finalGrade;
    if (finalGrade === undefined) {
        finalGrade = 100;
    }

    if (!email || !name || !password || !role || !subjects) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const id = generateId(); // Generate the unique ID

    const query = `INSERT INTO accounts (email, id, name, password, role, subjects, finalGrade) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(
        query,
        [email, id, name, password, role, JSON.stringify(subjects), finalGrade],
        (err) => {
            if (err) {
                console.error('Error inserting user:', err.message);
                return res.status(500).json({ message: 'Error adding user to the database.' });
            }
            return res.status(200).json({ message: 'User added successfully.', id });
        }
    );
});

app.get('/api/students', (req, res) => {
    const query = `SELECT * FROM accounts WHERE role = 'student'`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving students:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        rows.forEach(row => {
            row.subjects = JSON.parse(row.subjects); // Convert subjects back to an array
        });
        return res.status(200).json({ students: rows });
    });
});

app.get('/api/student/:id', (req, res) => {
    const studentId = req.params.id; // Get the student ID from the URL parameter
    const query = `SELECT * FROM accounts WHERE id = ? AND role = 'student'`; // Use parameterized query to prevent SQL injection

    db.get(query, [studentId], (err, row) => {
        if (err) {
            console.error('Error retrieving student:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        row.subjects = JSON.parse(row.subjects); // Convert subjects back to an array
        return res.status(200).json(row); // Return the student data as a JSON response
    });
});

app.put('/api/student/:id', (req, res) => {
    const { email, name, password, role, subjects } = req.body;
    const studentId = req.params.id;  // Get the student ID from the URL parameter

    let finalGrade = req.body.finalGrade;
    if (finalGrade === undefined) {
        finalGrade = 100;
    }



    // Validate input data
    if (!studentId || !email || !name || !password || !role || !subjects) {
        return res.status(400).json({ message: 'All fields are required, including the student ID.' });
    }


    // Convert subjects to JSON string if it is an array
    const subjectsJson = Array.isArray(subjects) ? JSON.stringify(subjects) : subjects;

    // Update query for the given student ID
    const query = `UPDATE accounts SET email = ?, name = ?, password = ?, role = ?, subjects = ?, finalGrade = ? WHERE id = ?`;

    // Parameters for the update query
    const params = [email, name, password, role, subjectsJson, finalGrade, studentId];

    db.run(query, params, function (err) {
        if (err) {
            console.error('Error updating student:', err.message);
            return res.status(500).json({ message: 'Error updating student.' });
        }

        // If no rows were affected, that means no student was found with the given ID
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Successful update
        return res.status(200).json({ message: 'Student updated successfully.' });
    });
});

// API to delete a student
app.delete('/api/student/:id', (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM accounts WHERE id = ?`;
    db.run(query, [id], (err) => {
        if (err) {
            console.error('Error deleting student:', err.message);
            return res.status(500).json({ message: 'Error deleting student.' });
        }
        return res.status(200).json({ message: 'Student deleted successfully.' });
    });
});



// Get all lecturers
app.get('/api/lecturers', (req, res) => {
    const query = `SELECT * FROM accounts WHERE role = 'lecturer'`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving lecturers:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        rows.forEach(row => {
            row.subjects = JSON.parse(row.subjects); // Convert subjects back to an array
        });
        return res.status(200).json({ lecturers: rows });
    });
});

// Get a specific lecturer by ID
app.get('/api/lecturer/:id', (req, res) => {
    const lecturerId = req.params.id; // Get the lecturer ID from the URL parameter
    const query = `SELECT * FROM accounts WHERE id = ? AND role = 'lecturer'`; // Use parameterized query to prevent SQL injection

    db.get(query, [lecturerId], (err, row) => {
        if (err) {
            console.error('Error retrieving lecturer:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Lecturer not found.' });
        }

        row.subjects = JSON.parse(row.subjects); // Convert subjects back to an array
        return res.status(200).json(row); // Return the lecturer data as a JSON response
    });
});

app.put('/api/lecturer/:id', (req, res) => {
    const { email, name, password, role, subjects } = req.body;
    const lecturerId = req.params.id;  // Get the student ID from the URL parameter
    let finalGrade = req.body.finalGrade;
    if (finalGrade === undefined) {
        finalGrade = 100;
    }


    // Validate input data
    if (!lecturerId || !email || !name || !password || !role || !subjects) {
        return res.status(400).json({ message: 'All fields are required, including the lecturer ID.' });
    }


    // Convert subjects to JSON string if it is an array
    const subjectsJson = Array.isArray(subjects) ? JSON.stringify(subjects) : subjects;

    // Update query for the given student ID
    const query = `UPDATE accounts SET email = ?, name = ?, password = ?, role = ?, subjects = ?, finalGrade = ? WHERE id = ?`;

    // Parameters for the update query
    const params = [email, name, password, role, subjectsJson, finalGrade, lecturerId];

    db.run(query, params, function (err) {
        if (err) {
            console.error('Error updating lecturer:', err.message);
            return res.status(500).json({ message: 'Error updating lecturer.' });
        }

        // If no rows were affected, that means no student was found with the given ID
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Lecturer not found.' });
        }

        // Successful update
        return res.status(200).json({ message: 'Lecturer updated successfully.' });
    });
});

// Delete a lecturer
app.delete('/api/lecturer/:id', (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM accounts WHERE id = ?`;
    db.run(query, [id], (err) => {
        if (err) {
            console.error('Error deleting lecturer:', err.message);
            return res.status(500).json({ message: 'Error deleting lecturer.' });
        }
        return res.status(200).json({ message: 'Lecturer deleted successfully.' });
    });
});


// Get all subjects
app.get('/api/subjects', (req, res) => {
    const query = `SELECT * FROM subjects`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving subjects:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        return res.status(200).json({ subjects: rows });
    });
});

// Get a specific subject by its ID
app.get('/api/subject/:id', (req, res) => {
    const subjectId = req.params.id;
    const query = `SELECT * FROM subjects WHERE id = ?`;

    db.get(query, [subjectId], (err, row) => {
        if (err) {
            console.error('Error retrieving subject:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        return res.status(200).json(row);
    });
});

// Add or update a subject
app.post('/api/subject', (req, res) => {
    const { id, name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Subject name is required.' });
    }

    const query = id
        ? `UPDATE subjects SET name = ? WHERE id = ?`
        : `INSERT INTO subjects (id, name) VALUES (?, ?)`;

    const params = id ? [name, id] : [generateSubjectId(), name];  // Use a function to generate a new unique subject ID if inserting

    db.run(query, params, (err) => {
        if (err) {
            console.error('Error saving subject:', err.message);
            return res.status(500).json({ message: 'Error saving subject.' });
        }
        return res.status(201).json({ message: 'Subject added/updated successfully.' });
    });
});

// Delete a subject by its ID
app.delete('/api/subject/:id', (req, res) => {
    const subjectId = req.params.id;

    const query = `DELETE FROM subjects WHERE id = ?`;
    db.run(query, [subjectId], (err) => {
        if (err) {
            console.error('Error deleting subject:', err.message);
            return res.status(500).json({ message: 'Error deleting subject.' });
        }
        return res.status(200).json({ message: 'Subject deleted successfully.' });
    });
});

// Helper function to generate a unique subject ID (if needed for new subjects)
function generateSubjectId() {
    return `SUB${Date.now().toString().slice(-6)}`; // Divide by 1000 to reduce the number of digits
}







// Authentication route
app.post('/api/authenticate', (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ message: 'ID and Password are required.' });
    }

    const query = `SELECT * FROM accounts WHERE id = ? AND password = ?`;
    db.get(query, [id, password], (err, user) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (user) {
            user.subjects = JSON.parse(user.subjects); // Convert subjects back to an array
            return res.status(200).json({ user });
        } else {
            return res.status(401).json({ message: 'Invalid ID or Password.' });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
