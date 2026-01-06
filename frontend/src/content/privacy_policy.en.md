# SmileCRM Privacy Policy

**Effective Date:** {{DATE}}  
**Version:** {{VERSION}}

---

## Summary (TL;DR)

- SmileCRM is a tool for dentists: patient records, visits, treatment plans.
- We only store data you enter: information about doctors, patients, visits, and x-rays.
- Your data is protected: Telegram authentication, JWT tokens, data separation by doctor.
- We don't sell data to third parties and don't store credit card information.
- You can request deletion of your account and all data.

---

## A. Who We Are

**SmileCRM** is a dental practice management service available as a Telegram Mini App.

**Data Controller:**  
{{COMPANY_NAME}}  
{{ADDRESS}}  
Email: {{EMAIL}}

SmileCRM acts as a tool provider (data processor) for doctors, who are the data controllers of their patients' data.

---

## B. Data We Collect

### Doctor Data (Account)
- First and last name
- Specialization
- Phone number
- Clinic name
- Telegram User ID
- Trial and subscription dates

### Patient Data
- First and last name
- Phone number (optional)
- Diagnosis and doctor's notes
- Treatment status
- Treatment plan and payments
- Date of birth, gender (optional)

> ⚠️ **Important:** Diagnoses and medical notes are considered health data and require enhanced protection.

### Visit Data
- Visit date and next visit date
- Doctor's notes
- Prescribed medications

### Media Files
- X-ray images
- Photos (before/after treatment)
- Files are linked to specific patient and doctor

### Technical Data
- Telegram User ID and initData (for authentication)
- IP address (in server logs, minimal retention)
- Device type and browser (automatically from Telegram)

### Payment Data
- Payment ID from provider (Idram/IDBank)
- Amount and currency (AMD)
- Payment status
- Transaction date

> **We do NOT store credit card data.** All payments are processed directly by Idram and IDBank payment providers.

---

## C. Purposes of Data Processing

We process data for the following purposes:

1. **Service Provision** — patient records, visits, treatment plans management
2. **Security** — protection against unauthorized access and abuse
3. **User Support** — answering questions and resolving issues
4. **Payment Processing** — subscription management
5. **Product Improvement** — aggregated usage analytics (without personal data)

---

## D. Legal Basis

We process data on the following grounds:

- **Contract Performance** — providing SmileCRM services
- **Legitimate Interests** — ensuring security and fraud prevention
- **Consent** — for marketing communications (if applicable)

---

## E. Data Sharing with Third Parties

We may share data with the following categories of recipients:

| Recipient | Purpose | Data Type |
|-----------|---------|-----------|
| **Supabase** | Database and file storage | All data |
| **Telegram** | User authentication | Telegram ID, initData |
| **Idram / IDBank** | Payment processing | Payment identifiers |
| **Render / Vercel** | Application hosting | Technical data |

We may also disclose data in response to lawful requests from law enforcement authorities.

---

## F. International Data Transfer

Our providers' servers (Supabase, Render, Vercel) may be located outside Armenia. We apply organizational and technical measures to protect data during international transfers.

---

## G. Data Retention

- **Account and patient data** — retained while the account is active, plus a reasonable period after deletion for recovery purposes
- **Payment records** — {{PAYMENTS_RETENTION}} (for accounting and legal purposes)
- **Server logs** — up to 30 days

After retention periods expire, data is deleted or anonymized.

---

## H. Data Security

We implement the following security measures:

- ✅ **Telegram initData validation** — signature verification on each authentication
- ✅ **JWT tokens** — secure authentication for API requests
- ✅ **Data separation** — each doctor sees only their patients (filtering by doctor_id)
- ✅ **Encryption in transit** — HTTPS for all connections
- ✅ **Row Level Security** — access restrictions at database level
- ✅ **Access minimization** — only essential personnel have access to data

> ⚠️ Despite these measures, no system can guarantee 100% security. We recommend using strong passwords and not sharing access credentials with third parties.

---

## I. Your Rights

As a SmileCRM user, you have the right to:

- 📋 **Access** — obtain a copy of your data
- ✏️ **Rectification** — update inaccurate data
- 🗑️ **Erasure** — request deletion of your account and all data
- 📤 **Portability** — receive data in a machine-readable format (if technically feasible)
- ⛔ **Withdraw consent** — unsubscribe from marketing communications

**How to submit a request:**  
Send an email to {{EMAIL}} with subject "Data Request" and include your Telegram username.

We will respond within 30 days.

---

## J. Doctor's Responsibility for Patient Data

**Important to understand:**

- The doctor is the **data controller** of their patients' data
- SmileCRM is the **data processor** (provides the tool)
- The doctor is obligated to:
  - Have a lawful basis for collecting patient data
  - Inform patients about data processing
  - Ensure data confidentiality
  - Not share account access with third parties

SmileCRM is not responsible for the doctor's actions regarding their patients' data.

---

## K. Children

SmileCRM is not intended for use by persons under 18 as users (doctors). We do not knowingly collect data from children.

Data of minor patients may be entered by the doctor as part of medical practice — the doctor bears responsibility for this.

---

## L. Cookies and Tracking

SmileCRM as a Telegram Mini App **does not use cookies**.

We use browser **localStorage** only for:
- Storing selected interface language
- Storing authentication token (JWT)

We do not use advertising trackers or third-party analytics.

---

## M. Policy Changes

We may update this Privacy Policy. In case of significant changes, we will notify you through the application.

The current version is always available in the app via the "Privacy" link.

---

## N. Contact

For privacy questions, please contact:

**{{COMPANY_NAME}}**  
Email: {{EMAIL}}  
Address: {{ADDRESS}}

---

*Last updated: {{DATE}}*

