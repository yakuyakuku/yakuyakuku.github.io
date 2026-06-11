const fs = require('fs');
const path = require('path');

// Read files
const templateBase64 = fs.readFileSync(path.join(__dirname, 'template_base64.txt'), 'utf8').trim();
const aiChatMd = fs.readFileSync(path.join(__dirname, 'AI-Chat.md'), 'utf8');
const indexTemplate = fs.readFileSync(path.join(__dirname, 'index.template.html'), 'utf8');

// Replace placeholders
let htmlContent = indexTemplate;
htmlContent = htmlContent.replace('{{TEMPLATE_BASE64}}', templateBase64);
htmlContent = htmlContent.replace('"__AI_CHAT_MD_PLACEHOLDER__"', JSON.stringify(aiChatMd));


// Write to index.html
fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent);
console.log('Successfully generated self-contained index.html with base64 template and instructions!');
