//circle start
let progressBar = document.querySelector(".e-c-progress");
let indicator = document.getElementById("e-indicator");
let pointer = document.getElementById("e-pointer");
let length = Math.PI * 2 * 100;

progressBar.style.strokeDasharray = length;

function update(value, timePercent) {
  var offset = -length - (length * value) / timePercent;
  progressBar.style.strokeDashoffset = offset;
  pointer.style.transform = `rotate(${(360 * value) / timePercent}deg)`;
}
function displayTimeLeft(timeLeft) {
  //displays time on the input
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  let displayString = `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
  displayOutput.textContent = displayString;
  if (isStarted) {
    update(timeLeft, wholeTime);
  }
}

//circle ends
const displayOutput = document.querySelector(".display-remain-time");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const setterBtns = document.querySelectorAll("button[data-setter]");
const minInput = document.getElementById("timer-input-min");
const secInput = document.getElementById("timer-input-sec");

let intervalTimer;
let timeLeft;
let firstSetTime = 60; //단위는 초
let wholeTime = 60; // manage this to set the whole time
let isPaused = false;
let isStarted = false;
let isStopped = true;

update(firstSetTime, firstSetTime); //refreshes progress bar
displayTimeLeft(firstSetTime);

function changeWholeTime(seconds, set) {
  // started상태면 기존 남은 시간 timeLeft에
  if (wholeTime + seconds > 0) {
    // 만약 정지상태면 그냥 추가하고
    if (!isStarted) {
      if (!set) {
        firstSetTime += seconds;
      } else {
        firstSetTime = seconds;
      }
      displayTimeLeft(firstSetTime);
      isStopped = false;
      //   한번더 실행해줘야 정상 작동!
      pauseTimer();
    } else {
      //만약 일시정지상태였으면,
      if (isPaused) {
        isStarted = false;
        isStopped = true;
        timeLeft += seconds;
        wholeTime = timeLeft;

        clearInterval(intervalTimer);
        update(timeLeft, timeLeft);
        displayTimeLeft(timeLeft);
        //작동중이었으면
      } else {
        //처음시작한 것처럼.. 다시 시작하기
        isPaused = false;
        isStarted = false;
        isStopped = true;
        timeLeft += seconds;
        wholeTime = timeLeft;

        clearInterval(intervalTimer);
        update(timeLeft, timeLeft);
        displayTimeLeft(timeLeft);
        pauseTimer();
      }
    }
    // wholeTime += seconds;
  }
}

for (var i = 0; i < setterBtns.length; i++) {
  setterBtns[i].addEventListener("click", function (event) {
    var param = this.dataset.setter;
    switch (param) {
      case "minutes-plus":
        changeWholeTime(1 * 60);
        break;
      case "minutes-minus":
        changeWholeTime(-1 * 60);
        break;
      case "seconds-plus":
        changeWholeTime(10);
        break;
      case "seconds-minus":
        changeWholeTime(-10);
        break;
    }
  });
}

function timer(seconds) {
  //counts time, takes seconds
  let remainTime = Date.now() + seconds * 1000;
  displayTimeLeft(seconds);

  intervalTimer = setInterval(function () {
    timeLeft = Math.round((remainTime - Date.now()) / 1000);
    if (timeLeft < 0) {
      clearInterval(intervalTimer);
      isStarted = false;
      //   setterBtns.forEach(function (btn) {
      //     btn.disabled = false;
      //     btn.style.opacity = 1;
      //   });
      displayTimeLeft(wholeTime);
      pauseBtn.classList?.remove("pause");
      pauseBtn.classList?.add("play");
      return;
    }
    displayTimeLeft(timeLeft);
  }, 1000);
}
//
function pauseTimer(event) {
  if (!isStopped) {
    isPaused = false;
    isStarted = false;
    pauseBtn.classList?.remove("pause");
    pauseBtn.classList?.add("play");
    clearInterval(intervalTimer);
    wholeTime = firstSetTime;
    update(firstSetTime, firstSetTime);
    displayTimeLeft(firstSetTime);
    isStopped = true;
  } else if (isStarted === false) {
    timer(wholeTime);
    isStarted = true;
    this.classList?.remove("play");
    this.classList?.add("pause");

    // setterBtns.forEach(function (btn) {
    //   btn.disabled = true;
    //   btn.style.opacity = 0.5;
    // });
  } else if (isPaused) {
    this.classList?.remove("play");
    this.classList?.add("pause");
    timer(timeLeft);
    isPaused = isPaused ? false : true;
  } else {
    this.classList?.remove("pause");
    this.classList?.add("play");
    clearInterval(intervalTimer);
    isPaused = isPaused ? false : true;
  }
}

function resetTimer() {
  isStopped = false;
  pauseTimer();
  //   update(wholeTime, wholeTime);

  //   displayTimeLeft(wholeTime);
}

function setMinute(min) {
  changeWholeTime(min * 60, true);
}

pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
