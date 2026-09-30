let questionsData = [];
let metasData = [];
let currentIndex = 0;
let userAnswers = {};
let username = "";
let answerLocked = false;

const pageUsername = document.getElementById("page-username");
const pageIntro = document.getElementById("page-intro");
const pageQuiz = document.getElementById("page-quiz");
const pageResult = document.getElementById("page-result");

const usernameInput = document.getElementById("username-input");
const usernameConfirmBtn = document.getElementById("username-confirm-btn");
const introName = document.getElementById("intro-name");
const quizCount = document.getElementById("quiz-count");
const startBtn = document.getElementById("start-btn");
const questionProgress = document.getElementById("question-progress");
const questionText = document.getElementById("question-text");
const choicesContainer = document.getElementById("choices-container");
const progress = document.getElementById("progress");
const restartBtn = document.getElementById("restart-btn");

const resultLabel = document.getElementById("result-label");
const resultMessage = document.getElementById("result-message");
const resultDescription = document.getElementById("result-description");
const resultImage = document.getElementById("result-image");
const resultArt = document.getElementById("result-art");

function showPage(pageToShow) {
    [pageUsername, pageIntro, pageQuiz, pageResult].forEach(page => page.classList.remove("active"));
    pageToShow.classList.add("active");
    progress.classList.toggle("on", pageToShow === pageQuiz);
}

function buildProgress() {
    progress.innerHTML = "";
    questionsData.forEach(() => progress.appendChild(document.createElement("span")));
}

function updateProgress() {
    [...progress.children].forEach((segment, index) => {
        segment.classList.toggle("done", index <= currentIndex);
    });
}

function validateContent() {
    const validIds = new Set(metasData.map(meta => meta.id));
    questionsData.forEach(question => {
        question.choices.forEach(choice => {
            const targetMetaId = choice.preference + 1;
            if (!validIds.has(targetMetaId)) {
                console.warn(`Question ${question.id}: preference ${choice.preference} points to unknown Meta ID ${targetMetaId}`);
            }
        });
    });
}

async function loadContent() {
    try {
        const [questionsResponse, metasResponse] = await Promise.all([
            fetch("questions.json"),
            fetch("metas.json")
        ]);

        if (!questionsResponse.ok || !metasResponse.ok) {
            throw new Error("Quiz content could not be loaded.");
        }

        const questionsFile = await questionsResponse.json();
        const metasFile = await metasResponse.json();

        questionsData = questionsFile.questions || [];
        metasData = metasFile.metas || [];
        buildProgress();
        validateContent();
        quizCount.textContent = `${questionsData.length} quick questions. No wrong answers.`;
    } catch (error) {
        console.error("Error loading quiz content:", error);
        quizCount.textContent = "The quiz could not be loaded. Please refresh and try again.";
    }
}

function beginQuiz() {
    if (questionsData.length === 0) {
        alert("The quiz hasn't loaded yet. Please wait a moment or refresh the page.");
        return;
    }

    currentIndex = 0;
    userAnswers = {};
    showPage(pageQuiz);
    renderQuestion();
}

function renderQuestion() {
    const currentQuestion = questionsData[currentIndex];

    questionProgress.textContent = `Question ${currentIndex + 1} of ${questionsData.length}`;
    questionText.textContent = currentQuestion.question;
    updateProgress();
    choicesContainer.innerHTML = "";

    currentQuestion.choices.forEach((choice, index) => {
        const choiceButton = document.createElement("button");
        choiceButton.type = "button";
        choiceButton.className = "opt";
        choiceButton.innerHTML = `<kbd>${index + 1}</kbd><span></span>`;
        choiceButton.querySelector("span").textContent = choice.choice;
        choiceButton.addEventListener("click", () => selectAnswer(choiceButton, currentQuestion.id, choice.preference));
        choicesContainer.appendChild(choiceButton);
    });
}

function selectAnswer(button, questionId, metaId) {
    if (answerLocked) return;
    answerLocked = true;

    button.classList.add("picked");
    userAnswers[questionId] = metaId;

    setTimeout(() => {
        answerLocked = false;
        if (currentIndex < questionsData.length - 1) {
            currentIndex++;
            renderQuestion();
        } else {
            showResult();
        }
    }, 280);
}

function calculateMeta() {
    const tally = {};

    Object.values(userAnswers).forEach(metaId => {
        tally[metaId] = (tally[metaId] || 0) + 1;
    });

    let winningPreference = null;
    let highestCount = -1;

    Object.entries(tally).forEach(([preference, count]) => {
        if (count > highestCount) {
            winningPreference = Number(preference);
            highestCount = count;
        }
    });

    return winningPreference === null ? null : winningPreference + 1;
}

function showResult() {
    const winningId = calculateMeta();
    const meta = metasData.find(item => item.id === winningId);

    progress.classList.remove("on");
    pageResult.classList.remove("revealed");
    pageResult.classList.add("loading");
    showPage(pageResult);

    if (!meta) {
        resultLabel.textContent = "Something went wrong";
        resultMessage.textContent = "No Meta found";
        resultDescription.textContent = "Please try the quiz again.";
        resultImage.removeAttribute("src");
        resultImage.style.display = "none";
        resultArt.classList.add("empty");
        pageResult.classList.remove("loading");
        pageResult.classList.add("revealed");
        return;
    }

    resultLabel.textContent = `${username}, you are`;
    resultMessage.textContent = meta.type.trim();
    resultDescription.textContent = meta.description || "";
    resultArt.classList.remove("empty");
    resultImage.style.display = "block";
    resultImage.alt = meta.type.trim();
    resultImage.src = meta.image || "";

    resultImage.onerror = () => {
        resultImage.style.display = "none";
        resultArt.classList.add("empty");
    };

    setTimeout(() => {
        pageResult.classList.remove("loading");
        pageResult.classList.add("revealed");
    }, 1500);
}

usernameConfirmBtn.addEventListener("click", () => {
    const enteredUsername = usernameInput.value.trim();

    if (!enteredUsername) {
        usernameInput.classList.add("err");
        usernameInput.focus();
        setTimeout(() => usernameInput.classList.remove("err"), 400);
        return;
    }

    username = enteredUsername;
    introName.textContent = username;
    quizCount.textContent = `${questionsData.length} quick questions. No wrong answers.`;
    showPage(pageIntro);
});

usernameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") usernameConfirmBtn.click();
});

startBtn.addEventListener("click", beginQuiz);

restartBtn.addEventListener("click", () => {
    currentIndex = 0;
    userAnswers = {};
    username = "";
    usernameInput.value = "";
    pageResult.classList.remove("loading", "revealed");
    showPage(pageUsername);
    setTimeout(() => usernameInput.focus(), 50);
});

document.addEventListener("keydown", event => {
    if (!pageQuiz.classList.contains("active") || !/^[1-5]$/.test(event.key)) return;
    const button = choicesContainer.children[Number(event.key) - 1];
    if (button) button.click();
});

loadContent();
