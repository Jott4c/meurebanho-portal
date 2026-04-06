const fs = require('fs');
try {
  const content = fs.readFileSync('C:/Users/1822/.gemini/antigravity/brain/4c38dcd9-ad74-44eb-b81e-056a0725e7b2/.system_generated/steps/283/output.txt', 'utf8');
  const parsed = JSON.parse(content);
  console.log(JSON.stringify(parsed, null, 2).slice(0, 1000));
} catch (e) {
  console.error(e);
}
