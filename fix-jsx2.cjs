const fs = require('fs');
let code = fs.readFileSync('src/components/Panels.tsx', 'utf8');

code = code.replace(
  /               \{user\?\.email === "jrnabil570@gmail\.com" && \(\n                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Keamanan & Sistem<\/h3>\n               <div>\n                 <div className="bg-slate-50 dark:bg=\\[#121212\\] border border-slate-200 dark:border-white\/5 rounded-2xl overflow-hidden flex flex-col">\n                     <button onClick=\{\(\) => \{ onClose\(\); onOpenAdmin\(\); \}\}/,
  "               {user?.email === 'jrnabil570@gmail.com' && (\n               <div>\n                 <h3 className=\"text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2\">Keamanan & Sistem</h3>\n                 <div className=\"bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col\">\n                     <button onClick={() => { onClose(); onOpenAdmin(); }}"
);

fs.writeFileSync('src/components/Panels.tsx', code);
