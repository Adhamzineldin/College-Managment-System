const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Import Veld-generated route registrars
const { authRouter } = require('../generated/routes/auth.routes');
const { usersRouter } = require('../generated/routes/users.routes');
const { studentsRouter } = require('../generated/routes/students.routes');
const { lecturersRouter } = require('../generated/routes/lecturers.routes');
const { subjectsRouter } = require('../generated/routes/subjects.routes');
const { examsRouter } = require('../generated/routes/exams.routes');

// Import Veld-generated error factories
const { authErrors } = require('../generated/errors/auth.errors');
const { usersErrors } = require('../generated/errors/users.errors');
const { studentsErrors } = require('../generated/errors/students.errors');
const { lecturersErrors } = require('../generated/errors/lecturers.errors');
const { subjectsErrors } = require('../generated/errors/subjects.errors');
const { examsErrors } = require('../generated/errors/exams.errors');

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
                subjects TEXT NOT NULL,
                finalGrade REAL NOT NULL
            )`,
            (err) => {
                if (err) console.error('Error creating accounts table:', err.message);
                else console.log('Accounts table created or already exists.');
            }
        );

        // Create subjects table if it doesn't exist
        db.run(
            `CREATE TABLE IF NOT EXISTS subjects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL
            )`,
            (err) => {
                if (err) console.error('Error creating subjects table:', err.message);
                else console.log('Subjects table created or already exists.');
            }
        );

        // Create exams table if it doesn't exist
        db.run(
            `CREATE TABLE IF NOT EXISTS exams (
                id TEXT PRIMARY KEY,
                subject_id TEXT NOT NULL,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                duration INTEGER NOT NULL,
                total_marks INTEGER NOT NULL,
                questions TEXT,
                answers TEXT,
                entredID TEXT,
                grades TEXT,
                FOREIGN KEY (subject_id) REFERENCES subjects(id)
            )`,
            (err) => {
                if (err) console.error('Error creating exams table:', err.message);
            }
        );

        // Seed dummy subjects if empty
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
                    db.run(`INSERT INTO subjects (id, name) VALUES (?, ?)`, [subject.id, subject.name], (err) => {
                        if (err) console.error('Error inserting subject:', err.message);
                        else console.log(`Subject added: ${subject.name}`);
                    });
                });
            }
        });

        // Seed default users if empty
        db.get('SELECT COUNT(*) AS count FROM accounts', (err, row) => {
            if (err) {
                console.error('Error checking accounts table:', err.message);
            } else if (row.count === 0) {
                const users = [
                    { email: 'admin@example.com', id: '20230001', name: 'Admin User', password: 'admin123', role: 'admin', subjects: ['CS101', 'CS102'], finalGrade: 100 },
                    { email: 'lecturer@example.com', id: '20230002', name: 'Lecturer User', password: 'lecturer123', role: 'lecturer', subjects: ['CS101', 'CS102'], finalGrade: 90 },
                    { email: 'student@example.com', id: '20230003', name: 'Student User', password: 'student123', role: 'student', subjects: ['MATH101', 'PHYS101'], finalGrade: 80 }
                ];
                users.forEach(user => {
                    db.run(
                        `INSERT INTO accounts (email, id, name, password, role, subjects, finalGrade) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [user.email, user.id, user.name, user.password, user.role, JSON.stringify(user.subjects), user.finalGrade],
                        (err) => {
                            if (err) console.error('Error inserting user:', err.message);
                            else console.log(`User ${user.role} added: ${user.name}`);
                        }
                    );
                });
            }
        });
    }
});

// ─── Helpers ─────────────────────────────────────────────────────────
const generateId = () => Date.now().toString().slice(-8);
const generateSubjectId = () => `SUB${Date.now().toString().slice(-6)}`;

// Helper: promisify db.all / db.get / db.run
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); });
});


// ─── Service Implementations (Veld interfaces) ──────────────────────

/** @type {import('../generated/interfaces/IAuthService').IAuthService} */
const authService = {
    async authenticate(input) {
        const { id, password } = input;
        if (!id || !password) throw authErrors.authenticate.missingFields('ID and Password are required.');

        const user = await dbGet(`SELECT * FROM accounts WHERE id = ? AND password = ?`, [id, password]);
        if (!user) throw authErrors.authenticate.invalidCredentials('Invalid ID or Password.');

        user.subjects = JSON.parse(user.subjects);
        return { user };
    }
};

/** @type {import('../generated/interfaces/IUsersService').IUsersService} */
const usersService = {
    async addUser(input) {
        const { email, name, password, role, subjects } = input;
        let finalGrade = input.finalGrade;
        if (finalGrade === undefined) finalGrade = 100;

        if (!email || !name || !password || !role || !subjects) {
            throw usersErrors.addUser.missingFields('All fields are required.');
        }

        const id = generateId();
        await dbRun(
            `INSERT INTO accounts (email, id, name, password, role, subjects, finalGrade) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [email, id, name, password, role, JSON.stringify(subjects), finalGrade]
        );
        return { message: 'User added successfully.', id };
    },

    async updateUser(id, input) {
        const { email, name, password, role, subjects, finalGrade } = input;
        if (!email || !name || !password || !role || !subjects || !id) {
            throw usersErrors.updateUser.missingFields('All fields are required, including the user ID.');
        }

        const subjectsJson = Array.isArray(subjects) ? JSON.stringify(subjects) : subjects;
        const finalGradeToUpdate = finalGrade || 100;

        const result = await dbRun(
            `UPDATE accounts SET email = ?, name = ?, password = ?, role = ?, subjects = ?, finalGrade = ? WHERE id = ?`,
            [email, name, password, role, subjectsJson, finalGradeToUpdate, id]
        );

        if (result.changes === 0) throw usersErrors.updateUser.notFound('User not found.');
        return { message: 'User updated successfully.' };
    }
};

/** @type {import('../generated/interfaces/IStudentsService').IStudentsService} */
const studentsService = {
    async listStudents() {
        const rows = await dbAll(`SELECT * FROM accounts WHERE role = 'student'`);
        rows.forEach(row => { row.subjects = JSON.parse(row.subjects); });
        return { students: rows };
    },

    async getStudent(id) {
        const row = await dbGet(`SELECT * FROM accounts WHERE id = ? AND role = 'student'`, [id]);
        if (!row) throw studentsErrors.getStudent.notFound('Student not found.');
        row.subjects = JSON.parse(row.subjects);
        return row;
    },

    async updateStudent(id, input) {
        const { email, name, password, role, subjects } = input;
        let finalGrade = input.finalGrade;
        if (finalGrade === undefined) finalGrade = 100;

        if (!id || !email || !name || !password || !role || !subjects) {
            throw studentsErrors.updateStudent.missingFields('All fields are required, including the student ID.');
        }

        const subjectsJson = Array.isArray(subjects) ? JSON.stringify(subjects) : subjects;

        const result = await dbRun(
            `UPDATE accounts SET email = ?, name = ?, password = ?, role = ?, subjects = ?, finalGrade = ? WHERE id = ?`,
            [email, name, password, role, subjectsJson, finalGrade, id]
        );
        if (result.changes === 0) throw studentsErrors.updateStudent.notFound('Student not found.');
        return { message: 'Student updated successfully.' };
    },

    async deleteStudent(id) {
        await dbRun(`DELETE FROM accounts WHERE id = ?`, [id]);
        return { message: 'Student deleted successfully.' };
    }
};

/** @type {import('../generated/interfaces/ILecturersService').ILecturersService} */
const lecturersService = {
    async listLecturers() {
        const rows = await dbAll(`SELECT * FROM accounts WHERE role = 'lecturer'`);
        rows.forEach(row => { row.subjects = JSON.parse(row.subjects); });
        return { lecturers: rows };
    },

    async getLecturer(id) {
        const row = await dbGet(`SELECT * FROM accounts WHERE id = ? AND role = 'lecturer'`, [id]);
        if (!row) throw lecturersErrors.getLecturer.notFound('Lecturer not found.');
        row.subjects = JSON.parse(row.subjects);
        return row;
    },

    async updateLecturer(id, input) {
        const { email, name, password, role, subjects } = input;
        let finalGrade = input.finalGrade;
        if (finalGrade === undefined) finalGrade = 100;

        if (!id || !email || !name || !password || !role || !subjects) {
            throw lecturersErrors.updateLecturer.missingFields('All fields are required, including the lecturer ID.');
        }

        const subjectsJson = Array.isArray(subjects) ? JSON.stringify(subjects) : subjects;

        const result = await dbRun(
            `UPDATE accounts SET email = ?, name = ?, password = ?, role = ?, subjects = ?, finalGrade = ? WHERE id = ?`,
            [email, name, password, role, subjectsJson, finalGrade, id]
        );
        if (result.changes === 0) throw lecturersErrors.updateLecturer.notFound('Lecturer not found.');
        return { message: 'Lecturer updated successfully.' };
    },

    async deleteLecturer(id) {
        await dbRun(`DELETE FROM accounts WHERE id = ?`, [id]);
        return { message: 'Lecturer deleted successfully.' };
    }
};

/** @type {import('../generated/interfaces/ISubjectsService').ISubjectsService} */
const subjectsService = {
    async listSubjects() {
        const rows = await dbAll(`SELECT * FROM subjects`);
        return { subjects: rows };
    },

    async getSubject(id) {
        const row = await dbGet(`SELECT * FROM subjects WHERE id = ?`, [id]);
        if (!row) throw subjectsErrors.getSubject.notFound('Subject not found.');
        return row;
    },

    async saveSubject(input) {
        const { id, name } = input;
        if (!name) throw subjectsErrors.saveSubject.missingFields('Subject name is required.');

        if (id) {
            await dbRun(`UPDATE subjects SET name = ? WHERE id = ?`, [name, id]);
        } else {
            await dbRun(`INSERT INTO subjects (id, name) VALUES (?, ?)`, [generateSubjectId(), name]);
        }
        return { message: 'Subject added/updated successfully.' };
    },

    async deleteSubject(id) {
        await dbRun(`DELETE FROM subjects WHERE id = ?`, [id]);
        return { message: 'Subject deleted successfully.' };
    }
};

/** @type {import('../generated/interfaces/IExamsService').IExamsService} */
const examsService = {
    async createExam(input) {
        const { subject_id, name, examDate, duration, total_marks, questions, answers } = input;
        const id = generateId();
        await dbRun(
            `INSERT INTO exams (id, subject_id, name, date, duration, total_marks, questions, answers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, subject_id, name, examDate, duration, total_marks, questions, answers]
        );
        return { message: 'Exam added successfully.', id };
    },

    async listExams() {
        const rows = await dbAll(`SELECT * FROM exams`);
        const exams = rows.map(r => ({ ...r, examDate: r.date }));
        return { exams };
    },

    async listExamsBySubject(subject_id) {
        const rows = await dbAll(`SELECT * FROM exams WHERE subject_id = ?`, [subject_id]);
        const exams = rows.map(r => ({ ...r, examDate: r.date }));
        return { exams };
    },

    async getExam(id) {
        const row = await dbGet(`SELECT * FROM exams WHERE id = ?`, [id]);
        if (!row) throw examsErrors.getExam.notFound('Exam not found.');

        const questions = row.questions ? row.questions.split(';') : [];
        const answers = row.answers ? row.answers.split(';').map(a => a.replace(/{|}/g, '').split(';')) : [];

        return {
            ...row,
            examDate: row.date,
            questions,
            answers
        };
    },

    async updateExam(id, input) {
        const { subject_id, name, examDate, duration, total_marks, questions, answers, entredID, grades } = input;

        const result = await dbRun(
            `UPDATE exams SET subject_id = ?, name = ?, date = ?, duration = ?, total_marks = ?, questions = ?, answers = ?, entredID = ?, grades = ? WHERE id = ?`,
            [subject_id, name, examDate, duration, total_marks, questions, answers, entredID, grades, id]
        );
        if (result.changes === 0) throw examsErrors.updateExam.notFound('Exam not found.');
        return { message: 'Exam updated successfully.' };
    },

    async deleteExam(id) {
        await dbRun(`DELETE FROM exams WHERE id = ?`, [id]);
        return { message: 'Exam deleted successfully.' };
    },

    async addStudentToExam(id, input) {
        const { studentId } = input;
        const newEntry = `{${studentId}}`;
        await dbRun(
            `UPDATE exams SET entredID = COALESCE(entredID, '') || ? WHERE id = ?`,
            [newEntry, id]
        );
        return { message: 'Student added successfully.' };
    },

    async submitExam(id, input) {
        const { studentId, answers, grade } = input;
        const gradeEntry = `{${studentId}: ${grade}}`;
        await dbRun(
            `UPDATE exams SET grades = COALESCE(grades, '') || ? WHERE id = ?`,
            [gradeEntry, id]
        );
        return { message: 'Exam submitted successfully.' };
    }
};

// ─── Register Veld-generated routes ─────────────────────────────────
authRouter(app, authService);
usersRouter(app, usersService);
studentsRouter(app, studentsService);
lecturersRouter(app, lecturersService);
subjectsRouter(app, subjectsService);
examsRouter(app, examsService);

// ─── Start server ───────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
