/* var for check entered */
localStorage.setItem("entered",false);

/* exam */
    
    let exam = JSON.parse(localStorage.exam);
    /* array for shiffling question */
    let shiffling = [];

    /* insert index */
    for (let i=0;i < exam.length;i++){
        shiffling[i] = i; 
    }

    /* shiffling question */
    for (let i=0;i < shiffling.length;i++){
        /* generate random number */
        let j = Math.floor(Math.random() * shiffling.length);
        console.log(j);

        /* swap questions */
        let temp = shiffling[i];
        shiffling[i] = shiffling[j];
        shiffling[j] = temp;
    }

    /* show questions after shiffling */
    for (let i=0;i < shiffling.length;i++){
        let q = document.createElement('div');
        q.className = 'question';
        q.innerHTML = `
                <div class="questionText" style="background-color: rgb(0, 255, 0);padding: 15px; font-size: 24px;border-bottom: 4px solid black;">
                    ${exam[shiffling[i]].questionText}
                </div>
                <div class="answers" style="display: flex;flex-direction: column;gap: 10px;font-size: 22px;padding: 20px;">
                    <label for="question${i+1}_1">
                        <input id="question${i+1}_1" value="${exam[shiffling[i]].questionanswer1}" name="question${i+1}" type="radio">
                            ${exam[shiffling[i]].questionanswer1}
                    </label>
                    <label for="question${i+1}_2">
                        <input id="question${i+1}_2" value="${exam[shiffling[i]].questionanswer2}" name="question${i+1}" type="radio">
                            ${exam[shiffling[i]].questionanswer2}
                    </label>
                    <label>
                        <input id="question${i+1}_3" value="${exam[shiffling[i]].questionanswer3}" name="question${i+1}" type="radio">
                        ${exam[shiffling[i]].questionanswer3}
                    </label>
                    <label>
                        <input id="question${i+1}_4" value="${exam[shiffling[i]].questionanswer4}" name="question${i+1}" type="radio">
                        ${exam[shiffling[i]].questionanswer4}
                    </label>
                </div>`    

        /* add to html file */
        document.querySelector(".exams").appendChild(q);
    }

    /* add submit buttom */
    let btn = document.createElement('button');
    btn.className = 'submit';
    let btn_text = document.createTextNode('Submit Answers');
    btn.appendChild(btn_text);
    btn.style.width = "10%";
    btn.style.height = "40px";
    btn.style.margin = "20px 45% 0 45%";
    btn.style.borderRadius = "5px";
    btn.style.backgroundColor = 'rgb(0, 255, 0)';
    btn.addEventListener("mouseover",function (){
        btn.style.backgroundColor = 'red';
        btn.style.color = 'white';
        btn.style.cursor = 'pointer';
    });
    btn.addEventListener("mouseout",function (){
        btn.style.backgroundColor = '#00ff3c';
        btn.style.color = 'black';
        btn.style.cursor = 'none';
    });
    document.querySelector(".exams").appendChild(btn);


setTimeout(() => {
    localStorage.entered = true;

    /* store student answer */
    let studentIndex = localStorage.studentIndex;
    let studentDegree = [JSON.parse(localStorage.students)[studentIndex].name];
    let questions = document.querySelectorAll(".question");    
    questions.forEach((ele,index) => {
        const radios = ele.querySelectorAll(`input[name="question${index+1}"]`);
        for (const radio of radios){
            if (radio.checked){
                studentDegree.push({questionsIndex: shiffling[index],answer: radio.value});
            }
        }
    });

    localStorage.setItem('studentDegree',JSON.stringify(studentDegree));

    location.href = 'Std_Profile.html';

}, 10000);

/* on click submit */
document.querySelector(".submit").addEventListener("click",function (){
    localStorage.entered = true;

    /* store student answer */
    let studentIndex = localStorage.studentIndex;
    let studentDegree = [{name: JSON.parse(localStorage.students)[studentIndex].name}];
    let questions = document.querySelectorAll(".question");    
    questions.forEach((ele,index) => {
        const radios = ele.querySelectorAll(`input[name="question${index+1}"]`);
        for (const radio of radios){
            if (radio.checked){
                studentDegree.push({questionsIndex: shiffling[index],answer: radio.value});
            }
        }
    });

    localStorage.setItem('studentDegree',JSON.stringify(studentDegree));

    location.href = 'Std_Profile.html';
});