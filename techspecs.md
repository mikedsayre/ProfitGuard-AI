# Technical Specifications: ProfitGuard AI

## 1. Executive Summary
ProfitGuard AI is a high-performance MarTech dashboard designed to solve the "ROAS Trap" by accounting for real-world business economics (COGS) across multiple platforms.

## 2. Technical Stack
- **Framework**: React 19.x (Environment: ES Modules via esm.sh)
- **Styling**: Tailwind CSS
- **Authentication Tooling**: Node.js + Google Auth Library

## 3. Core Logic Engine
### 3.1 Mathematical Models
- **Dynamic COGS Rate**: User-defined value `userCogs` (0.00 to 1.00).
- **Net Profit Formula**: `Margin = Revenue - (Revenue * userCogs) - Ad Spend`

### 3.2 Intelligence Layer (Action Plan)
- **Kill List**: `Margin < 0` OR `(Spend > 500 AND ROAS < 1.0)`.
- **Global Efficiency**: Alert triggered if `TotalMargin / TotalRevenue < 0.40` while COGS > 0.60.

### 3.3 Universal Parsing Logic (Normalization)
The parser utilizes alias-matching for header detection:
- **Campaign**: `Campaign`, `Campaign Name`, `Ad set name`.
- **Cost**: `Cost`, `Amount Spent`, `Spend`, `Total Cost`.
- **Revenue**: `Conv. value`, `Purchase Conversion Value`, `Revenue`, `Value`.

## 4. Reporting Architecture (Normalization)
To ensure maximum compatibility and zero-dependency bloat, ProfitGuard uses a text-normalization strategy for reporting.
- **Implementation**: Structured string generation from the `insights` state.
- **Copy System**: Primary access via `navigator.clipboard.writeText`.
- **Fallback**: Read-only `<textarea>` modal for manual selection and preview.

## 5. Authentication Flow (Production)
- **Refresh Token Automation**: `scripts/getRefreshToken.js` automates the OAuth handshake.

## 6. Development Roadmap
1.  **Phase 1-3**: Logic, UI, and Economics (Complete).
2.  **Phase 4**: Developer Tooling & Production Handshake (Complete).
3.  **Phase 5**: Intelligence Layer (Action Plan) (Complete).
4.  **Phase 6**: Universal Platform Support & Text Reporting (Complete).
5.  **Phase 7**: LLM integration for natural language strategy summaries.