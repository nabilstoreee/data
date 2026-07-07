const fs = require('fs');
let code = fs.readFileSync('src/components/Panels.tsx', 'utf8');
code = code.replace(/                     \)}\n/g, "");
code = code.replace(/\{user\?\.email === 'jrnabil570@gmail\.com' && \(\n                     <button onClick=\{\(\) => \{ onClose\(\); onOpenAdmin\(\); \}\}/, 
"{user?.email === 'jrnabil570@gmail.com' && (\n                     <button onClick={() => { onClose(); onOpenAdmin(); }}");
code = code.replace(/<span className="text-\[15px\] font-semibold text-slate-800 dark:text-slate-200">Pengaturan Akun \(Admin\)<\/span>\n                        <\/div>\n                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" \/>\n                     <\/button>\n/, 
"<span className=\"text-[15px] font-semibold text-slate-800 dark:text-slate-200\">Pengaturan Akun (Admin)</span>\n                        </div>\n                        <ChevronRight className=\"w-5 h-5 text-slate-400 dark:text-slate-600\" />\n                     </button>\n                     )}\n");

fs.writeFileSync('src/components/Panels.tsx', code);
