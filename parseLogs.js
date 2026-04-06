const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/1822/.gemini/antigravity/brain/4c38dcd9-ad74-44eb-b81e-056a0725e7b2/.system_generated/steps/283/output.txt', 'utf8');
  const parsed = JSON.parse(content);

  const results = parsed.result?.result || [];

  for (const item of results) {
    if (item.event_message && item.event_message.includes('Pagar.me')) {
      console.log('--- LOG ENTRY ---');
      console.log(item.event_message);
    }
  }
  
  if (results.length === 0) {
    console.log("No results or empty array.");
  }
} catch (e) {
  console.error(e);
}
