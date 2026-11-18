import React, { useState, useEffect } from 'react';
import { getSabotageBug, highlightCCode } from '../../game/taskCatalog.js';

const TASK_DURATION_SEC = 20;

export default function TaskModal({ station, isSabotage, onClose, onTaskSolved, onSabotagePatched }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedBugLine, setSelectedBugLine] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', text: string }
  const [leftMs, setLeftMs] = useState(TASK_DURATION_SEC * 1000);
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset state whenever a new station/mode opens
  useEffect(() => {
    setSelectedOption(null);
    setSelectedBugLine(null);
    setFeedback(null);
    setLeftMs(TASK_DURATION_SEC * 1000);
    setTimedOut(false);
    setSubmitting(false);
  }, [station?.id, isSabotage]);

  // 20-second task timer for standard Crewmate C coding tasks
  useEffect(() => {
    if (!station || isSabotage || submitting) return;
    const startTs = performance.now();
    const totalMs = TASK_DURATION_SEC * 1000;

    const interval = setInterval(() => {
      const remaining = Math.max(0, totalMs - (performance.now() - startTs));
      setLeftMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setTimedOut(true);
        setFeedback({ type: 'wrong', text: "⏰ TIME'S UP (20s)! Task failed — try again." });
        setTimeout(() => onClose(), 1400);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [station?.id, isSabotage, submitting, onClose]);

  if (!station) return null;

  const bugData = isSabotage ? getSabotageBug(station.id) : null;
  const leftSec = Math.ceil(leftMs / 1000);
  const pct = (leftMs / (TASK_DURATION_SEC * 1000)) * 100;
  const timerState = leftSec <= 5 ? 'danger' : leftSec <= 10 ? 'warn' : '';

  const handleSubmit = () => {
    if (timedOut || submitting) return;

    if (isSabotage) {
      if (selectedBugLine === bugData.bugLine) {
        setSubmitting(true);
        setFeedback({
          type: 'correct',
          text: `✅ SABOTAGE PATCHED! (+20 pts) — ${bugData.explanation}`
        });
        onSabotagePatched(station, selectedBugLine);
        setTimeout(() => onClose(), 1100);
      } else {
        setFeedback({
          type: 'wrong',
          text: '❌ WRONG LINE! Check pointers, loops, and array bounds.'
        });
      }
      return;
    }

    if (selectedOption === station.correctAnswer) {
      setSubmitting(true);
      const pts = station.points || 10;
      setFeedback({
        type: 'correct',
        text: `✅ CORRECT! (+${pts} pts) — ${station.explanation}`
      });
      onTaskSolved(station, station.options[selectedOption], pts);
      setTimeout(() => onClose(), 1100);
    } else {
      setFeedback({
        type: 'wrong',
        text: '❌ Incorrect output! Trace the C code quickly before time runs out!'
      });
    }
  };

  const canSubmit = !timedOut && !submitting && (isSabotage ? selectedBugLine !== null : selectedOption !== null);

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
                : station.taskTitle}
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
          {isSabotage ? bugData.question : station.taskQuestion}
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
              dangerouslySetInnerHTML={{ __html: highlightCCode(station.code) }}
            />
          )}
        </div>

        {!isSabotage && (
          <div className="options-grid">
            {station.options.map((opt, idx) => (
              <button
                key={idx}
                className={`btn-option ${selectedOption === idx ? 'selected' : ''}`}
                onClick={() => !timedOut && setSelectedOption(idx)}
              >
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            ))}
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
