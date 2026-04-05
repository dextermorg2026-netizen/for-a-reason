const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    
    // Reduce font weight by 1 step.
    newContent = newContent.replace(/font-black/g, 'TMP_BOLD');
    newContent = newContent.replace(/font-extrabold/g, 'TMP_SEMIBOLD');
    newContent = newContent.replace(/font-bold/g, 'TMP_SEMIBOLD');
    newContent = newContent.replace(/font-semibold/g, 'TMP_MEDIUM');
    
    newContent = newContent.replace(/TMP_BOLD/g, 'font-bold');
    newContent = newContent.replace(/TMP_SEMIBOLD/g, 'font-semibold');
    newContent = newContent.replace(/TMP_MEDIUM/g, 'font-medium');
    
    if (file.includes('LeaderboardPage.jsx')) {
        newContent = newContent.replace('Simulation Sector: Operational Hierarchy', 'Global Operative Evaluation Matrix');
    }
    
    if (file.includes('PodiumSection.jsx')) {
        newContent = newContent.replace(/if \(rank === 1\) return \".*\";/g, 'if (rank === 1) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;');
        newContent = newContent.replace(/if \(rank === 2\) return \".*\";/g, 'if (rank === 2) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;');
        newContent = newContent.replace(/return \"https:\/\/lh3.googleusercontent.com\/aida-public\/[^\"]*\";/g, 'return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "OP")}&background=random`;');
    }
    
    if (file.includes('Subjects.jsx')) {
        newContent = newContent.replace(/<h3 className=\"text-2xl font-semibold font-headline text-white mt-1\">\{otherSubject\.title\}<\/h3>/g, '<h3 className=\"text-2xl font-semibold font-headline text-white mt-1 uppercase\">{otherSubject.title}</h3>');
    }

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        modifiedCount++;
    }
});
console.log('Total files fixed:', modifiedCount);
