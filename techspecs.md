# ⚙️ Technical Specifications: ProfitGuard AI

## 1. Tech Stack
* **Framework**: React 18 (Vite)
* **Language**: TypeScript
* **Styling**: Tailwind CSS (Utility-first)
* **Icons**: Lucide React
* **Deployment**: Vercel (CI/CD via GitHub)

## 2. Data Ingestion & parsing
### Universal CSV Parser
The app uses a client-side parser (`App.tsx`) that normalizes disparate CSV headers into a standard `Campaign` interface.
* **Cost Detection**: Scans for `Cost`, `Amount Spent`, `Spend`, `Total Cost`.
* **Revenue Detection**: Scans for `Conv. value`, `Purchase Conversion Value`, `Revenue`, `Total Value`.
* **Sanitization**: Automatically strips currency symbols (`$`, `£`) and commas before parsing floats.

## 3. Business Logic (The "Profit Engine")
Calculations are performed in real-time based on the user's selected COGS (Cost of Goods Sold).
* **Formula**: `Net Margin = (Revenue - (Revenue * COGS_Percentage)) - Ad_Spend`
* **Risk Logic**:
    * `HIGH`: Net Margin < $0 (Active Loss)
    * `MEDIUM`: Net Margin < $100 (Thin Profit)
    * `LOW`: ROAS > 4.0 (High Efficiency)

## 4. Reporting Architecture
* **Insight Generation**: The `ActionPlanView` component re-evaluates all campaigns whenever the COGS slider changes.
* **Clipboard API**: The app utilizes `navigator.clipboard.writeText()` to generate a formatted ASCII-style report for easy sharing in text-based communication channels (Slack/Email).

## 5. Security & Privacy
* **Client-Side Processing**: All CSV parsing happens in the browser memory. No user financial data is uploaded to any server.
* **Simulation Mode**: API calls are mocked (`adsService.ts`) to demonstrate functionality without requiring live OAuth tokens.
