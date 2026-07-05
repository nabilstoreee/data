const fs = require('fs');
let code = fs.readFileSync('src/components/Panels.tsx', 'utf8');

code = code.replace(
  /               <div>\n                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Tentang<\/h3>/,
  "               <div className=\"mt-6\">\n                 <h3 className=\"text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2\">Tentang</h3>"
);

fs.writeFileSync('src/components/Panels.tsx', code);
