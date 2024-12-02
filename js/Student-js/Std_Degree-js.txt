/* check login */
if (localStorage.login == 0){
    location.href = 'login.html';
}

/* create card for subjects */
let studentIndex = JSON.parse(localStorage.studentIndex);
let subjects = JSON.parse(localStorage.students)[studentIndex].subjects;
let lecturers = JSON.parse(localStorage.lecturers);

if (subjects && localStorage.entered){
    let div_subjects = document.querySelector(".subjects");
    div_subjects.style.display = 'grid';
    div_subjects.style.gridTemplateColumns = 'repeat(3,32%)';
    div_subjects.style.padding = '40px';
    div_subjects.style.gap = '30px';
    div_subjects.style.height = "fit-content";
    
    subjects.forEach((subject) => {
        let div = document.createElement('div');
        div.style.height = '300px';
        div.style.backgroundColor = 'rgba(42, 133, 121, 0.833)';
        div.style.padding = '20px';
        div.style.borderRadius = "8px"
        div.style.boxShadow = "0 0 5px 3px";

        let h1 = document.createElement('h1');
        h1.style.textAlign = 'center';
        h1.style.marginBottom = "30px";
        h1.style.height = '100px';
        let text_h1 = document.createTextNode(subject);
        h1.appendChild(text_h1);
        div.appendChild(h1);

        /* search about lectrurer for this subject */
        let lecturer_name;
        lecturers.forEach((lecturer) => {
            lecturer.subjects.forEach((lect_subject) => {
                if (subject === lect_subject){
                    lecturer_name = lecturer.name;
                }
            });
        });

        let p = document.createElement('p');
        let text_p = document.createTextNode("The Lecturer name that review your answer is: ");
        p.appendChild(text_p);
        p.style.textAlign = 'center';
        let span = document.createElement('span');
        span.style.color = '#00ff3c';
        let span_text = document.createTextNode(lecturer_name);
        span.appendChild(span_text);
        p.appendChild(span);
        div.appendChild(p);

        let btn = document.createElement('button');
        btn.className = 'degree';
        btn.style.width = "80%";
        btn.style.height = "40px";
        btn.style.backgroundColor = "#00ff3c";
        btn.style.borderRadius = "6px";
        btn.style.margin = ' 50px 10% 10px 10%'
        btn.style.fontSize = '20px';
        let btn_text = document.createTextNode("Show Degree");
        btn.appendChild(btn_text);
        btn.addEventListener("mouseover",function (){
            btn.style.backgroundColor = 'red';
            btn.style.color = 'white';
            div.style.scale = '1.04';
            btn.style.cursor = 'pointer';
        });
        btn.addEventListener("mouseout",function (){
            btn.style.backgroundColor = '#00ff3c';
            btn.style.color = 'black';
            div.style.scale = '1';
            btn.style.cursor = 'none';
        });
        div.appendChild(btn);

        div_subjects.appendChild(div);
    });
}
else {
    /* select subject div */
    let subjects_div = document.querySelector(".subjects");
    /* hide subjects */

    document.querySelector(".container").removeChild(subjects_div);
    let p = document.createElement('p');
    let p_text = document.createTextNode('NOT DEGREE BE CALCULATED');
    p.appendChild(p_text);
    p.style.width = "30%";
    p.style.margin = "0 40%";

    document.querySelector('.container').appendChild(p);
}

/* display degree */
let exam = JSON.parse(localStorage.exam)
document.querySelectorAll("button.degree").forEach((ele) => {
    ele.addEventListener("click",function (){
        /* select subject div */
        let subjects_div = document.querySelector(".subjects");
        /* hide subjects */
        document.querySelector(".container").removeChild(subjects_div);
    
        /* create div for questions */
        let questions_div = document.createElement('div');
        questions_div.className = 'questions';
        questions_div.style.display = 'flex';
        questions_div.style.flexDirection = 'column';
        questions_div.style.gap = '20px';
        exam.forEach((question,i) => {
            let question_div = document.createElement('div');
            question_div.className = 'question';
            question_div.innerHTML = `
                    <div class="questionText" style="background-color: rgb(0, 255, 0);padding: 15px; font-size: 24px;border-bottom: 4px solid black;">
                        ${question.questionText}
                    </div>
                    <div style="background-color: white;padding-bottom: 20px">
                        <div class="answers" style=" display: flex;flex-direction: column;gap: 10px;font-size: 22px;padding: 20px;">
                            <label for="question${i+1}_1">
                                <input id="question${i+1}_1" value="${question.questionanswer1}" name="question${i+1}" type="radio">
                                    ${question.questionanswer1}
                            </label>
                            <label for="question${i+1}_2">
                                <input id="question${i+1}_2" value="${question.questionanswer2}" name="question${i+1}" type="radio">
                                    ${question.questionanswer2}
                            </label>
                            <label>
                                <input id="question${i+1}_3" value="${question.questionanswer3}" name="question${i+1}" type="radio">
                                ${question.questionanswer3}
                            </label>
                            <label>
                                <input id="question${i+1}_4" value="${question.questionanswer4}" name="question${i+1}" type="radio">
                                ${question.questionanswer4}
                            </label>
                        </div>
                        <p style="font-size: 20px;margin: 0 0 20px 30px;">Correct Answer: <span style="color: rgb(0, 255, 0);font-size: 20px;">${question.correctAnswer}</span></p>    
                    </div>`
            /* add to html file */
            questions_div.appendChild(question_div);
        });
        document.querySelector(".container").appendChild(questions_div);

        /* degree */
        let studentDegree = JSON.parse(localStorage.studentDegree);
        let degree = document.createElement('p');
        let span = document.createElement('span');
        span.textContent = `${studentDegree[studentDegree.length - 1]}/${exam.length}`;
        span.style.color = 'black';
        degree.textContent = `your Degree: `;
        degree.style.color = 'green';
        degree.style.display = 'flex';
        degree.style.flexDirection = 'row';
        degree.style.justifyContent = 'center';
        degree.style.width = '20%';
        degree.style.height = '35px';
        degree.style.borderRadius = '6px';
        degree.style.padding = '10px 0 0 0 ';
        degree.style.margin = '20px 40%'
        if (studentDegree[studentDegree.length - 1] <= 2){
            degree.style.backgroundColor = "red";
        } else if (studentDegree[studentDegree.length - 1] <= 4){
            degree.style.backgroundColor = "yellow";
        } else {
            degree.style.backgroundColor = "rgb(0, 255, 0)";
        }
        degree.appendChild(span);
        document.querySelector(".container").appendChild(degree);
    });
});

document.querySelector("#logout").addEventListener("click",function(){
    localStorage.login = 0;
        location.href = 'login.html';
});