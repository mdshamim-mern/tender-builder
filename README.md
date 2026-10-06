# Tender Document Package Builder

> **AI DevFest — Problem Statement Solution**  
> Frontend-only Web Application for turning loose PDF files into a verified, compliant, and correctly ordered tender submission package.

---

## 🌟 Overview & Key Highlights

In tender management, contractors and office staff often struggle with arranging mandatory and optional documents in the exact order required by the procuring entity, validating expiry dates against submission deadlines, eliminating accidental duplicates, and generating a standard cover page with precise page numbering.

This project delivers a 100% client-side, browser-based solution that:
1. **Parses & displays tender specifications** from `requirements.json` (Task 4.1).
2. **Handles multi-file PDF uploads** with instant page-count calculation, non-PDF rejection, and removal capability (Task 4.2).
3. **Enforces 1-to-1 matching constraints** between documents and uploaded files with instant re-matching and unmatching (Task 4.3).
4. **Calculates real-time document statuses** conforming strictly to Section 5:
   - `Missing` (Blocks generation)
   - `Expiry date needed` (Blocks generation)
   - `Expired` (Blocks generation)
   - `Not provided` (Optional, does not block)
   - `OK` (Valid, ready for inclusion)
5. **Detects duplicate files** using cryptographic SHA-256 content hashing, preventing identical files from being assigned across documents (Task 4.6).
6. **Compiles compliant merged PDF packages** per Section 6:
   - Page 1: Official English Cover Page with tender metadata and included documents table.
   - Strict document order, skipping omitted optional files.
   - Standard footer on every page: `<tender_id> | Page X of Y`.
   - Clear footer placement that preserves document readability.
7. **Full Dual-Language Support (English / বাংলা)**: All UI elements, badges, instructions, and document names switch seamlessly (Task 4.9).
8. **Implemented Bonus Features**:
   - Sequential Table of Contents / Index Page (Bonus 7.1)
   - PNG Digital Seal / Signature Stamp placement (Bonus 7.2)
   - Export checklist to CSV (Bonus 7.3)
   - Save and reopen project state / JSON session (Bonus 7.4)
   - Smart Auto-Matching algorithm based on filename keywords (Bonus 7.6)
   - Safe handling for damaged / encrypted PDFs (Bonus 7.7)
   - Live browser PDF preview modal

---

## 📸 Screenshots

| Screenshot | Description |
|---|---|
| `screenshots/01_initial_checklist_and_missing_statuses.png` | Initial checklist showing mandatory `Missing` statuses and blocking summary |
| `screenshots/02_verified_documents_and_ok_statuses.png` | Fully verified dashboard with `OK` statuses, matched files, and expiry dates |
| `screenshots/03_bangla_bilingual_interface.png` | Full Bengali interface with Bangla titles, labels, and status badges |

---

## 📦 Generated Output Package

The generated submission package produced from the resolved sample pack is located at:
- `output/T-2026-0417_Package.pdf` (12 total pages: Cover page + all 6 included documents in order with `<tender_id> | Page X of Y` footers on every page).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **PDF Manipulation**: `pdf-lib` (pure browser-side generation, merging, drawing, and footer stamping)
- **Hashing**: Web Crypto API (`crypto.subtle.digest('SHA-256')`)
- **State & Internationalization**: Custom dual-language dictionary and reactive React state
- **Visuals & Feedback**: Canvas Confetti, custom accessible status badges

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 🧪 Testing with Provided Materials

- Click **"Load Sample Pack (Demo)"** in the top bar to immediately load the sample tender data and test cases (valid trade license, expired trade license, duplicates, multi-page proposals, and solvency letter).
- You can also drag and drop any custom `requirements.json` or batch upload PDF files.
