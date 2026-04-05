const fs = require('fs');
const path = require('path');

const rootDir = process.argv[2] || '.';
const oldName = "firebase-key.json";
const newName = "firebase-key.json";

function redo(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                redo(fullPath);
            }
        } else if (file.endsWith('.py') || file.endsWith('.md') || file.endsWith('.cjs') || file.endsWith('.json')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(oldName)) {
                console.log(`Updating ${fullPath}`);
                const newContent = content.split(oldName).join(newName);
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    });
}

redo(rootDir);
console.log("Renaming completed.");
