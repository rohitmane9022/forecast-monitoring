# Wind Power Forecast Monitor

A full-stack web application to monitor UK national wind power generation forecasts against actual generation data. Built as part of a hiring challenge for Reint.ai.

## Live Demo

[App Link](https://forecast-monitoring-eight.vercel.app/)


---

## What This App Does

The app lets you visualize how accurate wind power forecasts are compared to what actually got generated. You pick a date range within January 2024, set a forecast horizon (how many hours ahead the forecast was made), and the chart shows both lines side by side so you can see how well the model performed.

Data comes from the Elexon BMRS API which is the official UK electricity market data platform. No API key needed, it is fully public.

---

## Project Structure

```
wind-forecast-monitor/
├── app/
│   ├── page.tsx                  # Main dashboard UI
│   └── api/
│       ├── actuals/
│       │   └── route.ts          # Fetches real wind generation (FUELHH)
│       └── forecasts/
│           └── route.ts          # Fetches wind forecasts (WINDFOR)
├── lib/
│   └── dataUtils.ts              # Horizon filtering logic
├── notebooks/
│   ├── forecast_error_analysis.ipynb    # Notebook 1 - forecast error analysis
│   └── wind_reliability_analysis.ipynb  # Notebook 2 - reliability recommendation
├── public/
├── README.md
└── package.json
```

---

## How to Run the App Locally

Make sure you have Node.js installed, then:

```bash
# Clone the repo
git clone https://github.com/rohitmane9022/forecast-monitoring
cd wind-forecast-monitor

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use the App

1. Select a **Start Time** and **End Time** within January 2024
2. Adjust the **Forecast Horizon** slider (0 to 48 hours)
3. Click **Apply**
4. The chart shows actual generation (blue line) vs forecasted generation (green dashed line)
5. Stats at the bottom show average actual, average forecast, and data point count

The forecast horizon controls how far ahead the forecast was made. For example at 4 hours, it shows the latest forecast that was published at least 4 hours before each target time.

---

## How to Run the Notebooks

Make sure you have Python installed, then:

```bash
# Install dependencies
pip install jupyter pandas numpy matplotlib seaborn requests

# Start Jupyter
jupyter notebook
```

Open either notebook from the `notebooks/` folder and run all cells top to bottom.

**Notebook 1 — forecast_error_analysis.ipynb**
Analyzes how accurate the wind forecasts are. Covers MAE, median error, p99 error, how error changes as horizon increases, and error patterns by time of day.

**Notebook 2 — wind_reliability_analysis.ipynb**
Looks at historical actual wind generation to figure out how reliably wind can meet electricity demand. Ends with a concrete MW recommendation backed by the data.

---

## Tech Stack

- **Frontend** — Next.js 14, React, Tailwind CSS, Recharts
- **Backend** — Next.js API Routes
- **Data Source** — Elexon BMRS API (public, no auth required)
- **Analysis** — Python, Pandas, NumPy, Matplotlib
- **Deployment** — Vercel

---

## Author

**Your Name**
[LinkedIn](https://www.linkedin.com/in/rohit-mane-89b180207/) | [Portfolio](https://rohitmane.vercel.app/)