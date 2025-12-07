const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '..', 'js', 'lib', 'butterchurn-presets.min.js');
let s = fs.readFileSync(filePath, 'utf8');
const regex = /(init_eqs_str|frame_eqs_str|pixel_eqs_str):"([\s\S]*?)"/g;
let replaced = 0;
s = s.replace(regex, (m, key, inner) => {
  // If inner already has explicit \n sequences only and no literal newlines, skip
  if (!/\r?\n/.test(inner)) return m;
  const escaped = inner.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/"/g, '\\"');
  replaced++;
  return `${key}:"${escaped}"`;
});
fs.writeFileSync(filePath, s, 'utf8');
console.log('Replaced blocks:', replaced);
