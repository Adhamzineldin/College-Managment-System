/**
 * Veld Client — Browser-compatible API client
 * Auto-mirrors the generated Veld client for use in plain HTML/JS pages.
 *
 * Usage:
 *   <script src="../../js/veld-client.js"></script>
 *   Then use: veld.Auth.authenticate({ id, password })
 *             veld.Students.listStudents()
 *             veld.Exams.getExam(id)
 *
 *   Error matching:
 *     catch (err) {
 *       if (veld.isErrorCode(err, veld.Auth.errors.authenticate.invalidCredentials)) { ... }
 *     }
 */
(function (root) {
    "use strict";

    // ── Base URL ─────────────────────────────────────────────────────
    const BASE = window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://app5000.maayn.me";

    // ── Error class (mirrors generated VeldApiError) ─────────────────
    class VeldApiError extends Error {
        constructor(status, body, code) {
            super(`Veld API error ${status}: ${body}`);
            this.name = "VeldApiError";
            this.status = status;
            this.body = body;
            this.code = code || "";
        }
    }

    async function parseError(res) {
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            return new VeldApiError(res.status, json.error || text, json.code || "");
        } catch {
            return new VeldApiError(res.status, text);
        }
    }

    /** Type guard — checks if err is a VeldApiError */
    function isApiError(err) {
        return err instanceof VeldApiError;
    }

    /** Check if an error matches a specific Veld error code string */
    function isErrorCode(err, code) {
        return err instanceof VeldApiError && err.code === code;
    }

    // ── HTTP helpers ─────────────────────────────────────────────────
    async function get(path) {
        const res = await fetch(BASE + path);
        if (!res.ok) throw await parseError(res);
        return res.json();
    }

    async function post(path, body) {
        const res = await fetch(BASE + path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) throw await parseError(res);
        return res.json();
    }

    async function put(path, body) {
        const res = await fetch(BASE + path, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) throw await parseError(res);
        return res.json();
    }

    async function del(path, body) {
        const res = await fetch(BASE + path, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) throw await parseError(res);
        return res.json();
    }

    // ── API namespaces (mirrors generated Veld client exactly) ───────

    /** Auth module */
    const Auth = {
        authenticate: (input) => post("/api/authenticate", input),
        errors: {
            authenticate: {
                invalidCredentials: "AUTHENTICATE_INVALID_CREDENTIALS",
                missingFields: "AUTHENTICATE_MISSING_FIELDS",
            },
        },
    };

    /** Users module */
    const Users = {
        addUser: (input) => post("/api/add-user", input),
        updateUser: (id, input) => put(`/api/updateUser/${id}`, input),
        errors: {
            addUser: {
                missingFields: "ADD_USER_MISSING_FIELDS",
                conflict: "ADD_USER_CONFLICT",
            },
            updateUser: {
                missingFields: "UPDATE_USER_MISSING_FIELDS",
                notFound: "UPDATE_USER_NOT_FOUND",
            },
        },
    };

    /** Students module */
    const Students = {
        listStudents: () => get("/api/students"),
        getStudent: (id) => get(`/api/student/${id}`),
        updateStudent: (id, input) => put(`/api/student/${id}`, input),
        deleteStudent: (id) => del(`/api/student/${id}`, {}),
        errors: {
            getStudent: {
                notFound: "GET_STUDENT_NOT_FOUND",
            },
            updateStudent: {
                missingFields: "UPDATE_STUDENT_MISSING_FIELDS",
                notFound: "UPDATE_STUDENT_NOT_FOUND",
            },
            deleteStudent: {
                notFound: "DELETE_STUDENT_NOT_FOUND",
            },
        },
    };

    /** Lecturers module */
    const Lecturers = {
        listLecturers: () => get("/api/lecturers"),
        getLecturer: (id) => get(`/api/lecturer/${id}`),
        updateLecturer: (id, input) => put(`/api/lecturer/${id}`, input),
        deleteLecturer: (id) => del(`/api/lecturer/${id}`, {}),
        errors: {
            getLecturer: {
                notFound: "GET_LECTURER_NOT_FOUND",
            },
            updateLecturer: {
                missingFields: "UPDATE_LECTURER_MISSING_FIELDS",
                notFound: "UPDATE_LECTURER_NOT_FOUND",
            },
            deleteLecturer: {
                notFound: "DELETE_LECTURER_NOT_FOUND",
            },
        },
    };

    /** Subjects module */
    const Subjects = {
        listSubjects: () => get("/api/subjects"),
        getSubject: (id) => get(`/api/subject/${id}`),
        saveSubject: (input) => post("/api/subject", input),
        deleteSubject: (id) => del(`/api/subject/${id}`, {}),
        errors: {
            getSubject: {
                notFound: "GET_SUBJECT_NOT_FOUND",
            },
            saveSubject: {
                missingFields: "SAVE_SUBJECT_MISSING_FIELDS",
            },
            deleteSubject: {
                notFound: "DELETE_SUBJECT_NOT_FOUND",
            },
        },
    };

    /** Exams module */
    const Exams = {
        createExam: (input) => post("/api/exam", input),
        listExams: () => get("/api/exams"),
        listExamsBySubject: (subjectId) => get(`/api/exams/${subjectId}`),
        getExam: (id) => get(`/api/exam/${id}`),
        updateExam: (id, input) => put(`/api/exam/${id}`, input),
        deleteExam: (id) => del(`/api/exam/${id}`, {}),
        addStudentToExam: (id, input) => put(`/api/exam/${id}/add-student`, input),
        submitExam: (id, input) => post(`/api/exam/${id}/submit`, input),
        errors: {
            createExam: {
                missingFields: "CREATE_EXAM_MISSING_FIELDS",
            },
            getExam: {
                notFound: "GET_EXAM_NOT_FOUND",
            },
            updateExam: {
                notFound: "UPDATE_EXAM_NOT_FOUND",
                missingFields: "UPDATE_EXAM_MISSING_FIELDS",
            },
            deleteExam: {
                notFound: "DELETE_EXAM_NOT_FOUND",
            },
            addStudentToExam: {
                notFound: "ADD_STUDENT_TO_EXAM_NOT_FOUND",
                alreadyEntered: "ADD_STUDENT_TO_EXAM_ALREADY_ENTERED",
            },
            submitExam: {
                notFound: "SUBMIT_EXAM_NOT_FOUND",
            },
        },
    };

    // ── Expose globally ──────────────────────────────────────────────
    root.veld = {
        Auth,
        Users,
        Students,
        Lecturers,
        Subjects,
        Exams,
        VeldApiError,
        isApiError,
        isErrorCode,
    };

})(window);

