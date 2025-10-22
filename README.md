# 🧠 Knowledge Base Validator App

## 📌 Overview

The Knowledge Base Validator is a Next.js-based AI demo app that helps users validate and structure unstructured requests (e.g., RFPs, emailed quotes, questions) using semantic understanding. Powered by Lyzr AI endpoints (or simulated JSON responses), the app extracts actionable insights from pasted input and organizes it into structured categories such as intent, routing, items, and knowledge base matches. It also includes a feedback loop to refine accuracy over time through user interaction.

---

## 🎯 Purpose

Modern business communication often arrives in unstructured formats, making it difficult to extract actionable intent and route it efficiently. This app solves that by:

- Understanding pasted messages using LLMs.
- Extracting and categorizing the information in structured format.
- Matching content to existing knowledge base articles.
- Allowing users to validate agent responses through upvotes, comments, and classification tags.
- Supporting both simulated and live agent modes via Lyzr.

---

## 🧠 Key AI Features

| Feature | Description |
|--------|-------------|
| **Semantic Intent Extraction** | Detects and classifies user request intent (e.g., order, support, inquiry) |
| **Routing Suggestion** | Suggests which department or system should handle the request |
| **Order Data Parsing** | Identifies and extracts SKUs, item names, quantities from text |
| **Knowledge Base Match** | Finds relevant KB articles using semantic search and lists confidence scores |
| **Knowledge Gap Detection** | Surfaces areas where the KB lacks coverage for the current request |
| **Feedback Loop** | Users can upvote/downvote the response, leave comments, and tag issues |
| **Simulated Agent Mode** | Predefined JSON responses mimic real Lyzr outputs for demo use |
| **Live Agent Integration** | Users can plug in a real Lyzr endpoint to activate production AI responses |

---

## 🧱 App Structure

### 1. 📥 Input Pane
- Paste in unstructured user input (e.g., email, RFP, chat message).
- Submit button triggers agent analysis.
- Toggle between Simulated vs. Live mode.

### 2. 📤 Agent Output Pane
Displays structured interpretation of the input:

```json
{
  "intent": "Order Request",
  "routing": "Sales Team - SMB",
  "items": [
    {"sku": "P1234", "description": "Widget A", "quantity": 50},
    {"sku": "P5678", "description": "Widget B", "quantity": 20}
  ],
  "kb_matches": [
    {"title": "Widget A Specs", "confidence": 0.92},
    {"title": "Ordering Policy", "confidence": 0.88}
  ],
  "knowledge_gaps": [
    "No policy on international orders",
    "Missing delivery SLA for Widget B"
  ]
}
````

### 3. 📊 Feedback Panel

* 👍 / 👎 buttons for rating agent response.
* Optional comment box for freeform feedback.
* Multi-select tag input (e.g., "routing incorrect", "SKU missing", "unclear response").
* Stores feedback and input payload together.

### 4. 📚 History & Review (Optional Phase 2)

* Table of past interactions:

  * Input text
  * Structured output
  * Feedback + tags
  * Timestamp
* Ability to export logs to CSV/JSON.

### 5. ⚙️ Settings / Configuration

* Add and save Lyzr agent endpoint.
* Toggle live/simulated mode.
* Upload custom KB documents (PDF, CSV, TXT).
* Downloadable demo data and feedback logs.

---

## 📦 Demo Data Structure

All mock responses are stored under `/data/responses/*.json` following the Lyzr schema:

* `intent`: String
* `routing`: String
* `items`: Array of SKU objects
* `kb_matches`: Array with `title` and `confidence`
* `knowledge_gaps`: String array

---

## 🔗 Lyzr Endpoint Integration

To enable live agent mode:

1. Go to **Settings** tab.
2. Paste your Lyzr endpoint URL (e.g., `https://agent.lyzr.ai/validate-kb`).
3. Toggle to "Live" mode.
4. The app will now send user input to your agent for real-time responses.

---

## 🚀 MVP Acceptance Criteria

* ✅ App accepts pasted input and returns structured output (simulated and real).
* ✅ User can rate responses and provide free-text feedback.
* ✅ Tags can be applied to classify feedback.
* ✅ Feedback is stored with original input and response.
* ✅ Developer can swap JSON files or live endpoints seamlessly.

---

## 🔮 Future Enhancements

* Feedback visualization dashboard.
* Auto-KB update suggestions based on repeated gaps.
* Role-based routing for IT, Legal, HR, etc.
* Voice input support.
* Slack or Microsoft Teams integration.
* Multilingual intent recognition and KB matching.

---

## 🛠️ Tech Stack

| Layer                 | Technology                                      |
| --------------------- | ----------------------------------------------- |
| **Frontend**          | Next.js, Tailwind CSS, ShadCN UI                |
| **Feedback Storage**  | Supabase (PostgreSQL) or Firebase (alternative) |
| **Agent Integration** | Lyzr HTTP endpoint or local JSON                |
| **Demo Deployment**   | Netlify or Vercel                               |

---

## 📁 File Structure (Sample)

```
├── components/
│   ├── InputPane.tsx
│   ├── OutputPane.tsx
│   ├── FeedbackPane.tsx
├── pages/
│   ├── index.tsx
│   ├── settings.tsx
├── data/
│   ├── simulated_request_1.json
│   ├── simulated_request_2.json
├── lib/
│   ├── agentClient.ts
│   ├── feedbackStorage.ts
```

---

## ✅ Simulated Scenarios

Include 3–5 example files under `/data/` for:

* Order quote with missing delivery info
* Support inquiry with unclear routing
* RFP with multiple product SKUs
* Complaint with no match in KB
* FAQ-style multi-part query

---

## 🧪 Testing Notes

* Test all flows in both Simulated and Live modes.
* Verify that feedback and tagging are preserved across sessions.
* Validate accuracy of structured response and KB confidence scores.

---

## 📣 Call to Action

Want to see your own agent in action? Replace the demo endpoint in the Settings tab with your own Lyzr Agent URL, or contact [support@lyzr.ai](mailto:support@lyzr.ai) for help deploying a custom KB validator agent.

```
