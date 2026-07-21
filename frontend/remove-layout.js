const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<AppLayout>')) {
        content = content.replace(/<AppLayout>/g, '<>');
        content = content.replace(/<\/AppLayout>/g, '</>');
        content = content.replace(/import \{ AppLayout \}.*?\n/g, '');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}
walk('./app');
console.log('Done replacing AppLayout');
