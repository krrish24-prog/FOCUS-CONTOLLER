let countdown;
let inactivityTimer;
let remainingSeconds = 0;
let paused = false;
let totalSeconds = 0;

function populateTimeOptions() {
  for (let i = 0; i <= 12; i++) {
    const val = String(i).padStart(2, "0");
    document.getElementById("hours").appendChild(new Option(val, i));
  }
  for (let i = 0; i < 60; i++) {
    const val = String(i).padStart(2, "0");
    document.getElementById("minutes").appendChild(new Option(val, i));
    document.getElementById("seconds").appendChild(new Option(val, i));
  }
}

function startTimer() {
  clearInterval(countdown);
  clearTimeout(inactivityTimer);
  paused = false;

  const h = +document.getElementById("hours").value;
  const m = +document.getElementById("minutes").value;
  const s = +document.getElementById("seconds").value;

  const selectedTime = h * 3600 + m * 60 + s;

  if (selectedTime === 0) return;

  totalSeconds = selectedTime;
  remainingSeconds = selectedTime;

  updateDisplay();
  updateProgressRing();
  runCountdown();

  document.getElementById("stop-section").style.display = "none";
  document.getElementById("motivation").style.display = "none";
}

function runCountdown() {
  countdown = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(countdown);
      document.getElementById("finish-sound").play();
      updateProgressRing();
      logSession("✅ Completed full session");
      alert("🎉 Focus session complete!");
      return;
    }
    remainingSeconds--;
    updateDisplay();
    updateProgressRing();
  }, 1000);
  resetInactivityTimer();
}

function stopTimer() {
  paused = true;
  clearInterval(countdown);
  clearTimeout(inactivityTimer);
  document.getElementById("popup").style.display = "none";
  document.getElementById("stop-section").style.display = "block";
}

function resumeTimer() {
  if (paused && remainingSeconds > 0) {
    runCountdown();
  }
}

function submitReason() {
  const reason = document.getElementById("stop-reason").value.trim();
  if (reason === '') {
    alert("Please enter a reason before submitting.");
    return;
  }
  document.getElementById("motivation").style.display = "block";
  document.getElementById("stop-section").style.display = "none";
  logSession(`🛑 Stopped early – Reason: ${reason}`);
}

function updateDisplay() {
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;
  document.getElementById("timer-display").textContent =
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateProgressRing() {
  const circle = document.querySelector('.ring-fill');
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const percent = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const offset = circumference * percent;
  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = `${offset}`;
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (!paused) {
      document.getElementById("popup").style.display = "block";
    }
  }, 15000);
}

["mousemove", "keydown", "mousedown", "touchstart"].forEach(event => {
  document.addEventListener(event, () => {
    document.getElementById("popup").style.display = "none";
    if (!paused) resetInactivityTimer();
  });
});

window.addEventListener("beforeunload", function (e) {
  const message = "⚠ IF YOU CLOSED FOR PROPER REASON - GOOD TO MOVE ON\n🚫 ELSE GOODBYE FROM MYSIDE (TIME) — YOU ARE OUT OF COMPETITION.";
  e.preventDefault();
  e.returnValue = message;
  return message;
});

function logSession(message) {
  const now = new Date();
  const entry = `${now.toLocaleString()} — ${message}`;
  let logs = JSON.parse(localStorage.getItem("focusLogs")) || [];
  logs.push(entry);
  localStorage.setItem("focusLogs", JSON.stringify(logs));
  renderLogs();
}

function renderLogs() {
  const logs = JSON.parse(localStorage.getItem("focusLogs")) || [];
  const logList = document.getElementById("log-list");
  logList.innerHTML = "";
  logs.slice().reverse().forEach(log => {
    const li = document.createElement("li");
    li.textContent = log;
    logList.appendChild(li);
  });
}

function clearLogs() {
  if (confirm("Are you sure you want to clear all session logs?")) {
    localStorage.removeItem("focusLogs");
    renderLogs();
  }
}

populateTimeOptions();
renderLogs();
