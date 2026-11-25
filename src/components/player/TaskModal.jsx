import React, { useState, useEffect, useRef } from 'react';
import { getSabotageBug, highlightCCode } from '../../game/taskCatalog.js';

const TASK_DURATION_SEC = 20;

export default function TaskModal({
  station,
  isSabotage,
  onClose,
  onTaskSolved,
  onTaskWrong,
  onSabotagePatched
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedBugLine, setSelectedBugLine] = useState(null);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', text: string }
  const [leftMs, setLeftMs] = useState(TASK_DURATION_SEC * 1000);
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const onTaskSolvedRef = useRef(onTaskSolved);
  useEffect(() => {
    onTaskSolvedRef.current = onTaskSolved;
  });

  const onTaskWrongRef = useRef(onTaskWrong);
  useEffect(() => {
    onTaskWrongRef.current = onTaskWrong;
  });

  const onSabotagePatchedRef = useRef(onSabotagePatched);
  useEffect(() => {
    onSabotagePatchedRef.current = onSabotagePatched;
  });

  const startTsRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  // Reset state whenever a new station/mode opens
  useEffect(() => {
    setSelectedOption(null);
    setSelectedBugLine(null);
    setWrongOptions([]);
    setFeedback(null);
    setLeftMs(TASK_DURATION_SEC * 1000);
    setTimedOut(false);
    setSubmitting(false);
    startTsRef.current = performance.now();

    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, [station?.id, isSabotage]);

  // 20-second task timer for standard Crewmate C coding tasks
  useEffect(() => {
    if (!station || isSabotage) return;

    if (!startTsRef.current) {
      startTsRef.current = performance.now();
    }
    const totalMs = TASK_DURATION_SEC * 1000;

    const interval = setInterval(() => {
      if (submitting || timedOut) return;

      const elapsed = performance.now() - startTsRef.current;
      const remaining = Math.max(0, totalMs - elapsed);
      setLeftMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setTimedOut(true);
        setFeedback({ type: 'wrong', text: "⏰ TIME'S UP (20s)! Task failed — try again." });
        autoCloseTimerRef.current = setTimeout(() => {
          onCloseRef.current?.();
        }, 1500);
      }
    }, 50);

    return () => {
      clearInterval(interval);
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [station?.id, isSabotage, submitting, timedOut]);

  if (!station) return null;

  const bugData = isSabotage ? getSabotageBug(station.id) : null;
  const leftSec = Math.ceil(leftMs / 1000);
  const pct = Math.max(0, Math.min(100, (leftMs / (TASK_DURATION_SEC * 1000)) * 100));
  const timerState = leftSec <= 5 ? 'danger' : leftSec <= 10 ? 'warn' : '';

  const qObj = station.activeQuestion || station;
  const taskTitle = qObj.title || station.taskTitle || 'C Coding Task';
  const taskQuestion = qObj.question || station.taskQuestion || 'What will be the output?';
  const taskCode = qObj.code || station.code || '';
  const taskOptions = qObj.options || station.options || [];
  const correctAnswer = qObj.correctAnswer ?? station.correctAnswer ?? 0;
  const taskExplanation = qObj.explanation || station.explanation || '';
  const taskPoints = qObj.points || station.points || 10;

  const handleSubmit = () => {
    if (timedOut || submitting) return;

    if (isSabotage) {
      if (selectedBugLine === bugData.bugLine) {
        setSubmitting(true);
        setFeedback({
          type: 'correct',
          text: `✅ SABOTAGE PATCHED! (+10 pts) — ${bugData.explanation}`
        });
        onSabotagePatchedRef.current?.(station, selectedBugLine);
        autoCloseTimerRef.current = setTimeout(() => onCloseRef.current?.(), 1100);
      } else {
        setFeedback({
          type: 'wrong',
          text: '❌ WRONG LINE! Check pointers, loops, and array bounds.'
        });
      }
      return;
    }

    if (selectedOption === correctAnswer) {
      setSubmitting(true);
      setFeedback({
        type: 'correct',
        text: `✅ CORRECT! (+${taskPoints} pts) — ${taskExplanation}`
      });
      onTaskSolvedRef.current?.(station, qObj, taskOptions[selectedOption], taskPoints);
      autoCloseTimerRef.current = setTimeout(() => onCloseRef.current?.(), 1100);
    } else {
      const wrongIdx = selectedOption;
      setWrongOptions((prev) => (prev.includes(wrongIdx) ? prev : [...prev, wrongIdx]));
      setSelectedOption(null);
      setFeedback({
        type: 'wrong',
        text: '❌ WRONG ANSWER! (-2 pts) Incorrect output. Trace the C code and try another option before time runs out!'
      });
      onTaskWrongRef.current?.(station, qObj, taskOptions[wrongIdx], 2);
    }
  };

  const canSubmit =
    !timedOut &&
    !submitting &&
    (isSabotage ? selectedBugLine !== null : selectedOption !== null && !wrongOptions.includes(selectedOption));

  return (
    <div className="modal-overlay open">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {isSabotage ? bugData.title : `📍 ${station.name}`}
            </div>
            <div
              className="modal-subtitle"
              style={{ color: isSabotage ? '#f87171' : '#38bdf8' }}
            >
              {isSabotage
                ? 'CRITICAL SABOTAGE — TAP THE BUGGY LINE BELOW'
                : taskTitle}
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {!isSabotage && (
          <div className="task-timer-wrap">
            <div className="task-timer-row">
              <span>⏱️ COMPLETE TASK IN 20 SECONDS</span>
              <span className={`task-timer-val ${timerState}`}>{leftSec}s</span>
            </div>
            <div className="task-timer-track">
              <div
                className={`task-timer-fill ${timerState}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        <div className="task-question-text">
          {isSabotage ? bugData.question : taskQuestion}
        </div>

        <div className="code-block">
          {isSabotage ? (
            bugData.lines.map((line, idx) => {
              const lineNum = idx + 1;
              return (
                <div
                  key={lineNum}
                  className={`code-line-row ${selectedBugLine === lineNum ? 'selected-bug' : ''}`}
                  onClick={() => setSelectedBugLine(lineNum)}
                >
                  <span className="line-number">{lineNum}</span>
                  <span dangerouslySetInnerHTML={{ __html: highlightCCode(line) }} />
                </div>
              );
            })
          ) : (
            <pre
              style={{ margin: 0 }}
              dangerouslySetInnerHTML={{ __html: highlightCCode(taskCode) }}
            />
          )}
        </div>

        {!isSabotage && (
          <div className="options-grid">
            {taskOptions.map((opt, idx) => {
              const isWrong = wrongOptions.includes(idx);
              return (
                <button
                  key={idx}
                  className={`btn-option ${selectedOption === idx ? 'selected' : ''} ${isWrong ? 'wrong-option' : ''}`}
                  disabled={timedOut || submitting || isWrong}
                  onClick={() => !timedOut && !submitting && !isWrong && setSelectedOption(idx)}
                >
                  {String.fromCharCode(65 + idx)}. {opt} {isWrong ? '❌ (-2 pts)' : ''}
                </button>
              );
            })}
          </div>
        )}

        {feedback && (
          <div
            className={`task-result-feedback ${feedback.type}`}
            style={{ display: 'block' }}
          >
            {feedback.text}
          </div>
        )}

        <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
          {isSabotage ? '🔧 PATCH SABOTAGE' : 'SUBMIT ANSWER'}
        </button>
      </div>
    </div>
  );
}
