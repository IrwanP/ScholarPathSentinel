# ScholarPath Sentinel

ScholarPath Sentinel is an agentic AI scholarship readiness assistant built for the **AI Agents: Intensive Vibe Coding Capstone Project**.

It helps students assess scholarship readiness, identify application risks, track recommender and deadline gaps, and receive guided next-best actions through an AI mentor, risk radar, preparation roadmap, and one-page readiness report.

## Key Features

- Scholarship readiness scoring
- Risk Radar for application risks
- Recommender readiness tracking
- Preparation roadmap
- AI mentor guidance
- One-page readiness report
- Scholarship matching and fit insights
- Final compliance scanner
- Manual final completion gate
- Human-in-the-loop review confirmation

## Demo Profile

The prototype uses **Alya Putri** as the demo student profile to show how readiness improves as key scholarship preparation steps are completed.

Alya is an Indonesian master's scholarship candidate preparing for a target scholarship application. The demo flow shows how ScholarPath Sentinel helps her identify blockers, follow the next best action, and improve readiness step by step.

## How to Run the App Locally

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

The Sentinel API health check is available at:

```text
http://localhost:3000/api/sentinel/health
```

## Recommended Demo Flow for Judges

1. Open the app at `http://localhost:3000`.
2. Use the preloaded **Alya Putri** demo profile.
3. Start from **Overview** to see Alya’s scholarship readiness summary.
4. Open **Readiness** to review the readiness dimensions and risk signals.
5. Go to **Preparation > Roadmap**.
6. Open the recommender step and click **Mark recommender submitted**.
7. Confirm the readiness score moves from **78% to 85%**, not directly to 90%.
8. Open the timeline step and click **Mark timeline drafted**.
9. Confirm the readiness score moves to **90%**.
10. Open **Final Review** and run the **Final Compliance Scanner**.
11. Confirm the readiness score moves to **94%**, not 100%.
12. Tick **Final Compliance Check fully completed**.
13. Complete **Final Human Review**.
14. Confirm the readiness score becomes **100%** only after both final compliance confirmation and human review are completed.

## Expected Readiness Progression

```text
78% → 85% → 90% → 94% → 100%
```

This staged progression is intentional. ScholarPath Sentinel does not overstate readiness just because one task is completed. The app only unlocks 100% readiness after the student has completed the critical preparation steps and the final human review.

## Final Verification Logic

ScholarPath Sentinel does not show **100% readiness** immediately after automated checks.

The final 100% score is only unlocked when:

- Recommender materials are submitted
- Timeline milestones are confirmed
- Automated compliance checks pass
- Final Compliance Check is manually confirmed
- Final Human Review is completed

This keeps the product aligned with a responsible human-in-the-loop scholarship preparation workflow.

## Status

This repository contains the current Kaggle submission snapshot of ScholarPath Sentinel, including the latest stage-based readiness flow, final compliance scanner, and human-in-the-loop review gating.