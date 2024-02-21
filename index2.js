//circle start
let progressBar = document.querySelector(".e-c-progress");
let indicator = document.getElementById("e-indicator");
let pointer = document.getElementById("e-pointer");
let switchBtn = document.getElementById("switch");
let containerDiv = document.querySelector(".container");
let leftTimeBtn = document.getElementById("left-time");
let length = Math.PI * 2 * 100;

let speakRate = 1; // 말하는 속도
let countdownRate = 1; // 카운트 다운 말하는 속도
let remainSpeak = true; // 남은시간 알려주기
let noiseOn = false;

let audioContext, analyser, microphone, javascriptNode; // 소음측정 관련 속성
let volumeSum = 0; // 소음측정 속성
let volumeCount = 0; // 소음측정 속성

let settingVolume = 50;

const inputField = document.getElementById("inputField");
const addForm = document.getElementById("input-form");
const inputList = document.getElementById("todo-div");
const inputWatchList = document.getElementById("watchTodo-div");

let stopWatchDiv = document.querySelector("#stopWatch-div");
const stopMin = document.getElementById("stopWatch-min");
const stopSec = document.getElementById("stopWatch-sec");
const stopCenSec = document.getElementById("stopWatch-censec");
const stopWatchRecord = document.getElementById("watchRecord-div");

const watchStartBtn = document.getElementById("startStopButton");
const watchResetBtn = document.getElementById("stopWatchReset");
const watchRecordBtn = document.getElementById("recordButton");

// 입력 내용 배열
const inputs = [];

// 입력 추가 버튼 클릭 이벤트 처리
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = inputField.value;
  if (input) {
    inputs.push(input);
    const li = document.createElement("li");
    li.textContent = input;
    li.title = "클릭해서 제거하기";
    li.addEventListener("click", () => {
      li.remove(); // 클릭한 입력 목록 제거
      const index = inputs.indexOf(input);
      if (index > -1) {
        inputs.splice(index, 1); // 배열에서도 제거
      }
    });
    if (switchBtn.innerText === "스톱워치 보기") {
      inputList.appendChild(li);
    } else {
      inputWatchList.appendChild(li);
    }

    inputField.value = "";
  }
});

const switchHandler = () => {
  if (switchBtn.innerText === "⏱️ 보기") {
    switchBtn.innerText = "⏳ 보기";
    containerDiv.style.display = "none";
    stopWatchDiv.style.display = "flex";
  } else {
    switchBtn.innerText = "⏱️ 보기";
    containerDiv.style.display = "flex";
    stopWatchDiv.style.display = "none";
  }
};

//브라우저의 종류에 따라.. 읽어주는 속도가 달라야함.
function getBrowserType() {
  const userAgent = navigator.userAgent;

  if (/(msie|trident)/i.test(userAgent)) {
    return "Internet Explorer";
  } else if (/firefox/i.test(userAgent)) {
    return "Firefox";
  } else if (/Chrome/.test(userAgent)) {
    if (/Edg/.test(userAgent)) {
      console.log("엣지");
      speakRate = 1.1;
      countdownRate = 1.5;
      return "Edge";
    }
    if (/OPR/.test(userAgent)) {
      return "Opera";
    }
    console.log("크롬");
    return "Chrome";
  } else if (/Safari/.test(userAgent)) {
    if (/EdgiOS/.test(userAgent)) {
      console.log("엣지");
      speakRate = 1.1;
      countdownRate = 1.5;
      return "Edge (iOS)";
    }
    if (/CriOS/.test(userAgent)) {
      return "Chrome (iOS)";
    }
    return "Safari";
  } else {
    return "Unknown";
  }
}

let browserType = getBrowserType();

if (browserType !== "Chrome" && browserType !== "Edge") {
  alert("크롬Chrome / 엣지Edge 브라우저에서 가장 잘 작동합니다!");
}

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
        // isStarted = false;
        isStopped = true;
        timeLeft += seconds;
        wholeTime = timeLeft;

        clearTimeout(intervalTimer);
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

        clearTimeout(intervalTimer);
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

  intervalTimer = setTimeout(function tick() {
    timeLeft = Math.round((remainTime - Date.now()) / 1000);
    if (timeLeft < 0) {
      clearTimeout(intervalTimer);
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
    // 남은시간이 전체 시간의 절반일 때 알려주기!
    if ((timeLeft / wholeTime) * 100 === 50 && timeLeft > 10) {
      if (remainSpeak) {
        let remainMS;
        //분 단위가 남았으면
        if (timeLeft > 60) {
          let remainM = Math.floor(timeLeft / 60);
          let remainS = timeLeft - remainM * 60;
          remainMS = remainM + "분" + remainS + "초";
          //초 단위가 남았으면
        } else {
          remainMS = timeLeft + "초";
        }
        speech(`시간의 반이 지났어요. ${remainMS} 남았어요.`);
      }
    } else {
      //1분 남았으면
      if (timeLeft === 60) {
        if (remainSpeak) {
          speech(`시간이 1분 남았어요.`);
        }
        // 10, 9, 8 ... 1까지카운트 다운
      } else if (timeLeft <= 10 && timeLeft > 0) {
        if (remainSpeak) {
          speech(`${+timeLeft}`, true);
        }
        //0일 때는 삐익! 끝났다는 노래 들려주기!
      } else if (timeLeft === 0) {
        var audio = new Audio("endingSound.mp3");
        audio.play();
        speech(`시간이 종료되었어요.`);
      }
    }

    displayTimeLeft(timeLeft);
    intervalTimer = setTimeout(tick, 1000);
  }, 1000);
}

// 경고음 재생 함수
function playWarningSound() {
  var audio = new Audio("beep.mp3");
  audio.play();
}

// 볼륨 체크 함수
function checkVolume() {
  javascriptNode.onaudioprocess = function () {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var values = 0;

    var length = array.length;
    for (var i = 0; i < length; i++) {
      values += array[i];
    }

    var average = values / length;
    volumeSum += average;
    volumeCount++;

    // 1초마다 평균 볼륨 계산 및 출력
    if (volumeCount >= 21) {
      // AudioContext의 sampleRate는 기본적으로 44100Hz이고, bufferSize가 1024라면 약 43회 호출로 1초
      console.log(Math.round(volumeSum / volumeCount));
      volumeSum = 0;
      volumeCount = 0;
    }

    // 볼륨이 settingVolume을 초과하면 경고음 재생
    if (average > settingVolume) {
      playWarningSound();
      // div 표시
      const warningDiv = document.getElementById("warningDiv");
      warningDiv.style.opacity = 1;

      // 2초 후 div 숨김
      setTimeout(() => {
        warningDiv.style.opacity = 0;
      }, 2000);
    }
  };
}

function control() {
  const controlButton = document.getElementById("noiseBtn");
  const volBtnsDiv = document.getElementById("volBtns");
  if (noiseOn) {
    stop();
    controlButton.innerText = "소곤소곤 🤫";
    noiseOn = false;
    volBtnsDiv.style.display = "none";
  } else {
    start();
    controlButton.innerText = "평소처럼 😊";
    volBtnsDiv.style.display = "flex";
    noiseOn = true;
  }
}

function start() {
  audioContext = new AudioContext();

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      microphone = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      checkVolume();
    })
    .catch((err) => {
      console.log("The following error occured: " + err);
    });
}

// 볼륨 체크 중지 함수
function stop() {
  javascriptNode.disconnect();
  analyser.disconnect();
  microphone.disconnect();
  audioContext.close();
}

document.getElementById("volumeRange").oninput = function () {
  settingVolume = this.value;
  document.getElementById("nowVolume").innerText = this.value;
};

function leftTimeHandler() {
  if (leftTimeBtn.innerText === "🔔 알림") {
    leftTimeBtn.innerText = "🔕 알림";
    remainSpeak = false;
  } else {
    leftTimeBtn.innerText = "🔔 알림";
    remainSpeak = true;
  }
}

//
function pauseTimer(event) {
  //중간에 멈춘 경우 초기 세팅으로 돌아가기
  if (!isStopped) {
    isPaused = false;
    isStarted = false;
    pauseBtn.classList?.remove("pause");
    pauseBtn.classList?.add("play");
    clearTimeout(intervalTimer);
    wholeTime = firstSetTime;
    update(firstSetTime, firstSetTime);
    displayTimeLeft(firstSetTime);
    isStopped = true;

    //시작하지 않았을 경우 시작하기
  } else if (isStarted === false) {
    timer(wholeTime);
    isStarted = true;
    this.classList?.remove("play");
    this.classList?.add("pause");

    //멈춰진 상태일 경우 다시 재생하기
  } else if (isPaused) {
    this.classList?.remove("play");
    this.classList?.add("pause");
    clearTimeout(intervalTimer);
    timer(timeLeft);
    isPaused = isPaused ? false : true;
    //타이머 실행(재생) 중인 경우 멈추기
  } else {
    this.classList?.remove("pause");
    this.classList?.add("play");
    clearTimeout(intervalTimer);
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

// 남은 시간 말해주는 부분
var voices = [];
function setVoiceList() {
  voices = window.speechSynthesis.getVoices();
}
setVoiceList();
if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = setVoiceList;
}
function speech(txt, countdown) {
  if (!window.speechSynthesis) {
    alert(
      "음성 재생을 지원하지 않는 브라우저입니다. 크롬, 파이어폭스 등의 최신 브라우저를 이용하세요"
    );
    return;
  }
  var lang = "ko-KR";
  var utterThis = new SpeechSynthesisUtterance(txt);
  utterThis.onend = function (event) {};
  utterThis.onerror = function (event) {
    console.log("error", event);
  };
  var voiceFound = false;
  for (var i = 0; i < voices.length; i++) {
    if (
      voices[i].lang.indexOf(lang) >= 0 ||
      voices[i].lang.indexOf(lang.replace("-", "_")) >= 0
    ) {
      utterThis.voice = voices[i];
      voiceFound = true;
    }
  }
  if (!voiceFound) {
    return;
  }
  utterThis.lang = lang;
  utterThis.pitch = 1;
  utterThis.rate = speakRate;
  if (countdown) {
    utterThis.rate = countdownRate; // 카운트 다운은 조금 빠르게 말해야 함.
  }
  window.speechSynthesis.speak(utterThis);
}

let time = 0;
let isRunning = false;
let intervalRef = null;
let records = [];

const startStopWatch = () => {
  if (!isRunning) {
    isRunning = true;
    intervalRef = setInterval(() => {
      time += 1;
      getMinutes();
      getSeconds();
      getCentiseconds();
    }, 10);
    watchRecordBtn.style.display = "block";
    watchStartBtn.className = "stopWatchPause";
  } else {
    isRunning = false;
    clearInterval(intervalRef);
    watchRecordBtn.style.display = "none";
    watchStartBtn.className = "stopWatchPlay";
  }
};

const resetStopWatch = () => {
  isRunning = false;
  clearInterval(intervalRef);
  time = 0;
  getMinutes();
  getSeconds();
  getCentiseconds();
  records = [];
  stopWatchRecord.innerText = "";
  watchRecordBtn.style.display = "none";
  watchStartBtn.className = "stopWatchPlay";
};

const recordWatch = () => {
  records.push(time);

  const li = document.createElement("li");
  li.style.margin = "0 2vw";
  li.textContent =
    records.length +
    ".  " +
    getMinutes(true) +
    " : " +
    getSeconds(true) +
    " : " +
    getCentiseconds(true);

  stopWatchRecord.appendChild(li);
};

const getMinutes = (record) => {
  if (!record) {
    stopMin.innerText = `0${Math.floor((time / 6000) % 60)}`.slice(-2);
  } else {
    return `0${Math.floor((time / 6000) % 60)}`.slice(-2);
  }
};
const getSeconds = (record) => {
  if (!record) {
    stopSec.innerText = `0${Math.floor((time / 100) % 60)}`.slice(-2);
  } else {
    return `0${Math.floor((time / 100) % 60)}`.slice(-2);
  }
};
const getCentiseconds = (record) => {
  if (!record) {
    stopCenSec.innerText = `0${time % 100}`.slice(-2);
  } else {
    return `0${time % 100}`.slice(-2);
  }
};
