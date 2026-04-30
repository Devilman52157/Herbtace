// One-shot codemod: rewrite `font-size: Nrpx` (and Npx) to
// `font-size: calc(Nrpx * var(--fs-scale, 1))` across all .wxss files
// under miniprogram/. Skips declarations that already use calc/var.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'miniprogram');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, out);
    else if (name.endsWith('.wxss')) out.push(p);
  }
  return out;
}

// Match: font-size: <num><unit>  where unit is rpx or px, and value is not already calc/var
const RE = /font-size\s*:\s*(\d+(?:\.\d+)?)(rpx|px)(?!\s*\*)/g;

let totalFiles = 0, totalReplacements = 0;
for (const file of walk(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  let count = 0;
  const next = orig.replace(RE, (m, num, unit, offset, str) => {
    // 跳过已经在 calc() 内的声明，防止二次替换
    const lineStart = str.lastIndexOf('\n', offset) + 1;
    const line = str.slice(lineStart, str.indexOf('\n', offset));
    if (line.includes('calc(')) return m;
    count++;
    return `font-size: calc(${num}${unit} * var(--fs-scale, 1))`;
  });
  if (count > 0) {
    fs.writeFileSync(file, next);
    totalFiles++;
    totalReplacements += count;
    console.log(`  ${path.relative(ROOT, file)}  +${count}`);
  }
}
console.log(`\nDone. ${totalReplacements} replacements across ${totalFiles} files.`);
