// Select Elements
const countSpan = document.querySelector('.count span');
const bullets = document.querySelector('.bullets');
const bulletsSpanContainer = document.querySelector('.bullets .spans');
const quizArea = document.querySelector('.quiz-area');
const answersArea = document.querySelector('.answers-area');
const submitButton = document.querySelector('.submit-button');
const resultsContainer = document.querySelector('.results');
const countdownElement = document.querySelector('.countdown');

// Set Options
let currentIndex = 0;
let rightAnswers = 0;
let countdownInterval;

function getQuestions() {
  let questionsRequest = new XMLHttpRequest();

  questionsRequest.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const questionsObject = JSON.parse(this.responseText);
      const qCount = questionsObject.length;

      // Create Bullets + Set Questions Count
      createBullets(qCount);

      // Add Question Data
      addQuetionData(questionsObject[currentIndex], qCount);

      // Start countdown
      countdown(5, qCount, questionsObject);

      // Click on submit
      submitButton.addEventListener(
        'click',
        submitButtonHandler.bind(this, questionsObject, qCount)
      );
    }
  };

  questionsRequest.open('GET', 'questions.json', true);
  questionsRequest.send();
}

getQuestions();

function createBullets(num) {
  countSpan.innerHTML = num;

  // Create Spans
  for (let i = 0; i < num; i++) {
    // Create Bullets
    const theBullet = document.createElement('span');

    // Check If Its First Span
    if (i === 0) {
      theBullet.className = 'on';
    }

    // Append Bullets To Main Bullet Container
    bulletsSpanContainer.appendChild(theBullet);
  }
}

function addQuetionData(obj, count) {
  if (currentIndex < count) {
    // Add Question Title
    const questionTitle = document.createElement('h2');
    questionTitle.appendChild(document.createTextNode(obj.title));
    quizArea.appendChild(questionTitle);

    // Create Answers
    for (let i = 1; i <= 4; i++) {
      const answerDiv = document.createElement('div');
      answerDiv.className = 'answer';

      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.name = 'answers';
      radioInput.id = `answer_${i}`;
      radioInput.dataset.answer = obj[`answer_${i}`];

      const inputLabel = document.createElement('label');
      inputLabel.setAttribute('for', `answer_${i}`);
      inputLabel.appendChild(document.createTextNode(obj[`answer_${i}`]));

      answerDiv.appendChild(radioInput);
      answerDiv.appendChild(inputLabel);
      answersArea.appendChild(answerDiv);
    }
  }
}

function submitButtonHandler(questionsObject, qCount) {
  // Get the right answer
  const theRightAnswer = questionsObject[currentIndex].right_answer;

  // Show error message if the user didn't select any answer
  const answers = document.getElementsByName('answers');
  if (
    !answers[0].checked &&
    !answers[1].checked &&
    !answers[2].checked &&
    !answers[3].checked
  ) {
    if (document.getElementsByClassName('wrong-message').length > 0) {
      return;
    }
    const wrongMessageDiv = document.createElement('div');
    wrongMessageDiv.appendChild(
      document.createTextNode('Please Select Answer')
    );
    wrongMessageDiv.className = 'wrong-message';
    wrongMessageDiv.style.padding = '20px';
    wrongMessageDiv.style.backgroundColor = '#dc7373';
    wrongMessageDiv.style.color = 'white';
    wrongMessageDiv.style.textAlign = 'center';
    wrongMessageDiv.style.fontWeight = 'bold';
    wrongMessageDiv.style.marginTop = '10px';
    wrongMessageDiv.style.marginBottom = '10px';
    answersArea.style.padding = '20px';
    quizArea.insertAdjacentElement('afterend', wrongMessageDiv);

    return;
  }

  // Remove the error message if the user select an answer
  if (document.getElementsByClassName('wrong-message').length > 0) {
    const wrongMessageDivs = document.getElementsByClassName('wrong-message');
    for (const wrongMessageDiv of wrongMessageDivs) {
      wrongMessageDiv.remove();
    }
  }

  // Check the answer
  checkAnswer(theRightAnswer, qCount);

  // Show next question data
  showNextQuestion(questionsObject, qCount);
}

function checkAnswer(theRightAnswer, qCount) {
  const answers = document.getElementsByName('answers');
  let theChosenAnswer;

  for (const answer of answers) {
    if (answer.checked) {
      theChosenAnswer = answer.dataset.answer;
    }
  }

  if (theChosenAnswer === theRightAnswer) {
    rightAnswers++;
  }
}

function handleBullets() {
  const bulletsSpans = document.querySelectorAll('.bullets .spans span');
  const spansArray = Array.from(bulletsSpans);
  spansArray.forEach((span, index) => {
    if (index === currentIndex) {
      span.className = 'on';
    }
  });
}

function showResults(count) {
  let theResults;
  if (currentIndex === count) {
    quizArea.remove();
    answersArea.remove();
    submitButton.remove();
    bullets.remove();

    if (rightAnswers > count / 2 && rightAnswers < count) {
      theResults = `<span class="good">Good</span>, ${rightAnswers} From ${count}`;
    } else if (rightAnswers === count) {
      theResults = `<span class="perfect">Perfect</span>, All Answers Is Good`;
    } else {
      theResults = `<span class="bad">Bad</span>, ${rightAnswers} From ${count}`;
    }

    resultsContainer.innerHTML = theResults;
    resultsContainer.style.padding = '10px';
    resultsContainer.style.backgroundColor = 'white';
    resultsContainer.style.marginTop = '10px';
  }
}

function showNextQuestion(questionsObject, qCount) {
  // Increase currentIndex
  currentIndex++;

  // Remove Previous Question
  quizArea.innerHTML = '';
  answersArea.innerHTML = '';

  // Add Question Data
  addQuetionData(questionsObject[currentIndex], qCount);

  // Handle bullets classes
  handleBullets();

  // Start countdown
  clearInterval(countdownInterval);
  countdown(5, qCount, questionsObject);

  // Show Results
  showResults(qCount);
}

function countdown(duration, qCount, questionsObject) {
  if (currentIndex < qCount) {
    let minutes, seconds;
    countdownInterval = setInterval(function () {
      minutes = parseInt(duration / 60);
      seconds = parseInt(duration % 60);

      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;

      countdownElement.innerHTML = `${minutes}:${seconds}`;

      if (--duration < 0) {
        showNextQuestion(questionsObject, qCount);
      }
    }, 1000);
  }
}
