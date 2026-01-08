const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'i18n', 'am.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add 'deleted' key after 'saved' in common section
if (!content.includes("deleted:")) {
  content = content.replace(
    /saved: '([^']+)',\n  \},\n\n  \/\/ Home page/,
    "saved: '$1',\n    deleted: '\u054B\u0576\u057E\u0561\u056E \u0567',\n  },\n\n  // Home page"
  );
}

// Add deleteVisit keys after editVisit in patientCard section
if (!content.includes("deleteVisit:")) {
  content = content.replace(
    /editVisit: '([^']+)',\n    visitDate:/,
    "editVisit: '$1',\n    deleteVisit: '\u054B\u0576\u057B\u0565\u056C \u0561\u0575\u0581\u0568',\n    deleteVisitConfirm: '\u054E\u057D\u057F\u0561\u0570\u0561\u057E\u0561\u057F \u0565\u0584 \u057B\u0576\u057B\u0565\u056C \u0561\u0575\u0581\u0568?',\n    visitDate:"
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Armenian translations updated successfully');
