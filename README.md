# Interactive Quiz App

A simple browser-based JavaScript quiz app with timed questions, instant feedback, progress tracking, and a final results summary.

## Features

- Multiple-choice quiz questions
- Countdown timer for each question
- Immediate feedback after answering
- Progress bar and question summary dots
- Final score breakdown and review of answered questions
- Restart button to try again

## Project Structure

- `index.html` — main HTML entry point
- `style.css` — visual styling for the quiz UI
- `data.js` — quiz questions, answers, explanations, and timer settings
- `app.js` — quiz logic, rendering, scoring, timer, and result handling

## How to Run

Open `index.html` in a browser, or serve the folder with a simple local server such as:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Notes

The quiz is built with plain HTML, CSS, and JavaScript with no external dependencies.
