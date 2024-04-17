import React, { useState, useRef, useEffect } from "react";
import Progress from "./progress-circle.jsx";
import "./style.css";

function Countdown() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeOver, setTimeOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  // used to see if clock has been initialized and started
  // useful for calc of timeRemaining which is used until reset
  const [timerInit, setTimerInit] = useState(0);

  // get user input for time
  const [inputHour, setInputHour] = useState("");
  const [inputMin, setInputMin] = useState("");
  const [inputSec, setInputSec] = useState("");

  const [buttonActivity, setButtonActivity] = useState("button-inactive");

  const intervalIdRef = useRef(null);

  // raw time since epic (big ass number)
  const endTimeRef = useRef(0);

  // difference in time in ms
  const initTimeRef = useRef(0);

  // ringtone
  const ringtoneRef = useRef(new Audio("./ringtone.mp3"));

  useEffect(() => {
    if (isRunning) {
      endTimeRef.current = Date.now() + timeRemaining;
      intervalIdRef.current = setInterval(updateTimeRemaining, 10);
    }
    return () => {
      clearInterval(intervalIdRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (timeOver) {
      ringtoneRef.current.play();
      ringtoneRef.current.volume = 0.15;
    } else {
      ringtoneRef.current.pause();
    }
  }, [timeOver]);

  function getHour(event) {
    let value = event.target.value.replace(/\D/g, "").slice(0, 2);
    if (value != 0) {
      setButtonActivity("button-active");
    }
    setInputHour(value);
  }

  function getMin(event) {
    let value = event.target.value.replace(/\D/g, "").slice(0, 2);
    if (value != 0) {
      setButtonActivity("button-active");
    }
    setInputMin(value);
  }

  function getSec(event) {
    let value = event.target.value.replace(/\D/g, "").slice(0, 2);
    if (value != 0) {
      setButtonActivity("button-active");
    }
    setInputSec(value);
  }

  function calcTime() {
    const hours = parseInt(inputHour * 60 * 60 * 1000);
    const mins = parseInt(inputMin * 60 * 1000);
    const secs = parseInt(inputSec * 1000);
    const totalTime = hours + mins + secs;
    return totalTime;
  }

  function updateTimeRemaining() {
    let timeDiff = endTimeRef.current - Date.now();
    // cant use timeRemaining because update is batched till interval over
    if (timeDiff > 0) {
      setTimeRemaining(timeDiff);
    } else {
      setTimeOver(true);
      reset();
    }
  }

  function start() {
    if (calcTime() != 0) {
      setButtonActivity("button-active");
      setIsRunning(true);
      if (timerInit == 0) {
        let initialTime = calcTime();
        initTimeRef.current = initialTime;
        setTimeRemaining(initTimeRef.current);
        setTimerInit(1);
      }
      setTimeOver(false);
    }
  }

  function stop() {
    setIsRunning(false);
    setTimeOver(false);
  }

  function reset() {
    setButtonActivity("button-inactive");
    // controls progress bar
    setTimeRemaining(initTimeRef.current);
    setIsRunning(false);
    setTimerInit(0);
  }

  function formatTime() {
    let hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    let minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
    let seconds = Math.floor((timeRemaining / 1000) % 60);
    let milliseconds = Math.floor((timeRemaining % 1000) / 10);

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");
    milliseconds = String(milliseconds).padStart(2, "0");

    let masterTime = `${hours}:${minutes}:${seconds}`;

    if (hours == 0) {
      masterTime = `${minutes}:${seconds}`;
    }

    return masterTime;
  }

  function calcProgress() {
    let progFormula = (timeRemaining / initTimeRef.current) * 100;
    return progFormula;
  }

  function calcEndTime() {
    // endTimeRef.current contains the ending time of counter in MS since epoch
    var time = new Date(endTimeRef.current); // give me date from given MS
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let dayTime = "";
    if (hours > 12) {
      hours -= 12;
      dayTime = "PM";
    } else {
      dayTime = "AM";
    }
    let futureTime = "";

    if (hours == 0) {
      futureTime =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        " " +
        dayTime;
    } else {
      futureTime =
        hours + ":" + String(minutes).padStart(2, "0") + " " + dayTime;
    }
    return futureTime;
  }

  function pauseRingtone() {
    setTimeOver(false);
  }

  return (
    <div className="container">
      <Progress
        progress={calcProgress()}
        className={"clock1"}
        inputElements={
          !isRunning ? (
            timerInit == 0 ? (
              <div className="input-container">
                <input
                  type="text"
                  value={inputHour}
                  maxLength={2}
                  placeholder="00"
                  onChange={getHour}
                  className="time-input"
                />
                :
                <input
                  type="text"
                  value={inputMin}
                  maxLength={2}
                  placeholder="00"
                  onChange={getMin}
                  className="time-input"
                />
                :
                <input
                  type="text"
                  value={inputSec}
                  maxLength={2}
                  placeholder="00"
                  onChange={getSec}
                  className="time-input"
                />
              </div>
            ) : (
              <span className="time-title">{formatTime()}</span>
            )
          ) : (
            <span className="time-title">{formatTime()}</span>
          )
        }
        endTime={
          timerInit == 1 ? (
            <div id="timer-end">
              <img id="bell-icon" src="./bell_white.svg" />
              <span id="end-time">{calcEndTime()}</span>
            </div>
          ) : null
        }
        logo={
          <div>
            <img className="logo" src="./logo.svg" onClick={pauseRingtone} />
          </div>
        }
      />
      <div className="buttons">
        {!isRunning ? (
          <button class={buttonActivity} id="start" onClick={start}>
            start
          </button>
        ) : (
          <button class="button-active" id="stop" onClick={stop}>
            pause
          </button>
        )}
        <button class="button-active" onClick={reset}>
          reset
        </button>
      </div>
      {/*
      <div className="diag">
        <h1>Diagnostic</h1> 
        <h1>{calcProgress()}%</h1>
        <h1>{calcEndTime()}</h1>
        <h1>
            time ratio: {timeRemaining} / {initTimeRef.current} ms
        </h1>
      </div> */}
    </div>
  );
}

export default Countdown;
