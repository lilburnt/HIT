var IntervalState = {
    prepare: 0, // initial phase to get ready to start work
    work: 1, // working interval
    rest: 2, // rest between intervals
    undefined: 4 // timer is not running
}

var TimerState = {
    running: 0,
    paused: 1,
    stopped: 2
}

// internal states
let timerId = null;
let intervalState = IntervalState.undefined;
let timerState = TimerState.stopped;
let setCount = 0;
let intElapsedTime = 0;
let totalElapsedTime = 0;
let totalDuration = 0;

// values to capture inputs
let workDuration = NaN;
let restDuration = NaN;
let reps = NaN;

// constant first phase duration to prepare
const prepareDuration = 3;

function updateTimerTextWrapper(iState, seconds){
    textString = `${iState} Time Left: ${seconds} seconds`;
    updateTimerText(textString);
}

function updateTimerText(textString) {
    document.getElementById('timerText').textContent = textString;
}

function updateProgressBar(id, progress) {
    document.getElementById(id).style.width = `${progress}%`;
}

function resetProgressBarAndText() {
    updateProgressBar('workProgress', 0);
    updateProgressBar('restProgress', 0);
    updateTimerText('');
}

function handleButtons(startVisible, pauseVisible, stopVisible, resumeVisible) {
    document.getElementById('startButton').style.display = startVisible ?  'inline-block': 'none';
    document.getElementById('pauseButton').style.display = pauseVisible ? 'inline-block': 'none';
    document.getElementById('stopButton').style.display = stopVisible ? 'inline-block': 'none';
    document.getElementById('resumeButton').style.display = resumeVisible ? 'inline-block': 'none';
}

function updateButtonVisibility(tState) {
    switch (tState) {
        case TimerState.running:
            // show: pause, stop
            handleButtons(/*start*/ false, /*pause*/ true, /*stop*/ true, /*resume*/ false)
            break;
        case TimerState.paused:
            // show: resume, stop
            handleButtons(/*start*/ false, /*pause*/ false, /*stop*/ true, /*resume*/ true)
            break;
        case TimerState.stopped:
            // show: start, stop
            handleButtons(/*start*/ true, /*pause*/ false, /*stop*/ true, /*resume*/ false)
            break
        default:
            alert('Invalid timer state for button visibility handling')
    }
}

function getCurrentIntervalDuration(iState) {
    // TODO create a map for this and update it on every start
    switch (iState) {
        case IntervalState.prepare:
            return prepareDuration;
        case IntervalState.work:
            return workDuration;
        case IntervalState.rest:
            return restDuration;
        default:
            alert(`Getting duration for undefined interval state  ${iState}`)
            return 0;
    }
}

function stopTimer() {
    // reset internal states
    intervalState = IntervalState.undefined;
    timerState = TimerState.stopped;

    // clear out timer and reps
    clearInterval(timerId);
    timerId = null;
    setCount = NaN;

    // update visuals
    updateButtonVisibility(timerState);
    resetProgressBarAndText();

    // clear out input variables
    workDuration = NaN;
    restDuration = NaN;
    reps = NaN;
    intElapsedTime = 0;
    totalElapsedTime = 0;
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    timerState = TimerState.paused;
    updateButtonVisibility(timerState);
}

function resumeTimer() {
    timerState = TimerState.running;
    updateButtonVisibility(timerState);
    startInterval();
}

function startTimer() {
    timerState = TimerState.running;
    updateButtonVisibility(timerState);

    // Update global variables upon starting the timer
    workDuration = parseInt(document.getElementById('workDuration').value, 10);
    restDuration = parseInt(document.getElementById('restDuration').value, 10);
    totalSets = parseInt(document.getElementById('repetitions').value, 10);
    totalDuration = prepareDuration + (workDuration + restDuration) * totalSets - restDuration;
    setCount = 0;

    if (isNaN(workDuration) || isNaN(restDuration) || isNaN(totalSets) || workDuration <= 0 || restDuration <= 0 || totalSets <= 0) {
        alert("Please enter valid positive numbers for all inputs.");
        stopTimer();
        return;
    }

    intervalState = IntervalState.prepare;
    startInterval();
}

function startInterval() {
     // Prevent multiple timers
    if (timerId) {
        alert('Multiple timers encountered, please reset');
        return;
    }

    timerId = setInterval(() => {
        if (timerState == TimerState.running) {
            let duration = getCurrentIntervalDuration(intervalState);
            updateProgressBar('repProgress', totalElapsedTime / totalDuration * 100);
            if (intElapsedTime <= duration) {
                // if within the current interval and the timer is still running
                let progress = (intElapsedTime / duration) * 100;
                switch (intervalState) {
                    case IntervalState.prepare:
                        // updateTimerTextWrapper(intervalState, duration - intElapsedTime);
                        updateTimerText(`Get ready in: ${duration - intElapsedTime}`);
                        updateProgressBar('workProgress', 0);
                        updateProgressBar('restProgress', 0);
                        break;
                    case IntervalState.work:
                        // updateTimerTextWrapper(intervalState, duration - intElapsedTime);
                        updateTimerText(`Keep going for: ${duration - intElapsedTime}`);
                        updateProgressBar('workProgress', progress);
                        updateProgressBar('restProgress', 0);
                        break;
                    case IntervalState.rest:
                        // updateTimerTextWrapper(intervalState, duration - intElapsedTime);
                        updateTimerText(`Get ready in: ${duration - intElapsedTime}`);
                        updateProgressBar('workProgress', 0);
                        updateProgressBar('restProgress', progress);
                        break;
                    default: 
                        updateTimerText('');
                        updateProgressBar('workProgress', 0);
                        updateProgressBar('restProgress', 0);
                }
                intElapsedTime++;
            }
            else {
                intElapsedTime = 0;
                // time for a transition or end the timer
                switch (intervalState) {
                    case IntervalState.prepare:
                        setCount++;
                        intervalState = IntervalState.work;
                        break;
                    case IntervalState.work:
                        setCount++;
                        intervalState = IntervalState.rest;
                        break;
                    case IntervalState.rest:
                        intervalState = IntervalState.work;
                        break;
                }

                // if the exit condition for the timer is met
                if (setCount > totalSets) {
                    alert("Finished all sets!");
                    stopTimer();
                    return;
                }

                // start next interval
                clearInterval(timerId);
                timerId = null;
                startInterval();
            }
            totalElapsedTime++;
        }

    }, 1000);
}