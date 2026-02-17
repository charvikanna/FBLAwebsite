# FinanceForStudents

An educational website for an online learning hub—created by students, for students—to make learning business and finance more engaging, collaborative, and accessible.

## Features

- **Schedule Page** – Live tutoring sessions and group study opportunities with an interactive calendar
- **Student Dashboard** – Track learning progress, completed activities, and course completion
- **Resources** – Lessons, videos, quizzes, and downloadable materials
- **Stock Market Game** – Simulated $10,000 to practice investing risk-free
- **AI Chatbot** – Ask personalized finance and business questions 24/7
- **Calendar** – Full calendar widget for viewing and booking sessions

## Cross-Platform Support

The site is responsive and works on:
- Desktop (Chrome, Firefox, Safari, Edge)
- Tablets
- Mobile phones (iOS Safari, Android Chrome)

Uses responsive design with `@media` queries and viewport meta tags.

## Evidence-Based Learning

Content aligned with legitimate sources:
- **Investor.gov (SEC)** – U.S. Securities and Exchange Commission
- **Khan Academy** – Accredited finance courses
- **CFA Institute** – Chartered Financial Analyst curriculum standards

## Metrics & Terminology

Industry-standard educational metrics addressed:
- **Completion Rate (CR)** – % of started content completed
- **Session Duration (SD)** – Time spent in learning sessions
- **Knowledge Retention (KR)** – Measured via quiz performance
- **User Engagement Score (UES)** – Activity and interaction metrics

## How to Run

1. Open `index.html` in a web browser (double-click or use File > Open).
2. Or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (npx)
   npx serve .
   ```
3. Visit `http://localhost:8000` (or the port shown).

## Structure

```
├── index.html          # Home
├── schedule.html       # Calendar & sessions
├── dashboard.html      # Student progress
├── resources.html      # Lessons, videos, quizzes
├── stock-game.html     # Stock simulator
├── css/
│   ├── styles.css      # Base styles
│   └── pages.css       # Page-specific styles
└── js/
    ├── app.js          # Shared utilities
    ├── calendar.js     # Calendar logic
    ├── chatbot.js      # AI study assistant
    ├── quizzes.js      # Quiz scoring
    └── stock-game.js   # Stock simulation
```

## License

Educational purposes only. Not financial advice.
