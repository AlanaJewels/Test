let Questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
const TIMER_LIMIT = 40;

const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const timerElement = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const feedbackElement = document.getElementById("feedback");
const scoreboardElement = document.getElementById("scoreboard");

async function startQuiz() {
    const category = document.getElementById("category").value;
    const difficulty = document.getElementById("difficulty").value;

    const response = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`
    );
    const data = await response.json();
    Questions = data.results.map((q) => ({
        question: decodeHTML(q.question),
        correct: decodeHTML(q.correct_answer),
        options: shuffle([decodeHTML(q.correct_answer), ...q.incorrect_answers]),
    }));

    document.querySelector(".settings").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";

    shuffleQuestions();
    loadQuestion();
}

function loadQuestion() {
    resetTimer();
    const currentQuestion = Questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    optionsElement.innerHTML = "";
    currentQuestion.options.forEach((option, index) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <input type="radio" name="answer" id="option${index}" value="${option}">
            <label for="option${index}">${option}</label>
        `;
        optionsElement.appendChild(div);
    });

    updateProgressBar();
    startTimer();
}

function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
        alert("Please select an answer!");
        return;
    }

    const userAnswer = selectedOption.value;
    const correctAnswer = Questions[currentQuestionIndex].correct;

    if (userAnswer === correctAnswer) {
        score++;
        feedbackElement.textContent = "Correct!";
        feedbackElement.style.color = "green";
    } else {
        feedbackElement.textContent = `Wrong! Correct answer: ${correctAnswer}`;
        feedbackElement.style.color = "red";
    }

    setTimeout(() => {
        feedbackElement.textContent = "";
        nextQuestion();
    }, 2000);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < Questions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    document.getElementById("quiz-container").style.display = "none";
    scoreboardElement.style.display = "block";
    scoreboardElement.innerHTML = `
        <h2>Quiz Completed!</h2>
        <p>Your Score: ${score}/${Questions.length}</p>
    `;
    saveToLeaderboard(score);
    displayLeaderboard();
}

function startTimer() {
    let timeLeft = TIMER_LIMIT;
    timerElement.textContent = `Time Left: ${timeLeft}`;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time Left: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / Questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function shuffleQuestions() {
    Questions.sort(() => Math.random() - 0.5);
}

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function saveToLeaderboard(score) {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ score, date: new Date().toLocaleString() });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.sort((a, b) => b.score - a.score);
    scoreboardElement.innerHTML += "<h3>Leaderboard:</h3>";
    leaderboard.forEach((entry, index) => {
        scoreboardElement.innerHTML += `<p>${index + 1}. Score: ${entry.score} (Date: ${entry.date})</p>`;
    });
}