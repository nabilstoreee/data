const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Undo adding user={user} everywhere
code = code.replace(/settings=\{settings\}\n        user=\{user\}/g, "settings={settings}");

// Add user={user} ONLY to SidebarMenu
code = code.replace(/<SidebarMenu \n        isOpen=\{showSidebar\}/, "<SidebarMenu \n        user={user}\n        isOpen={showSidebar}");

// Re-add the admin panel wrapper
code = code.replace(
  /<div className="flex justify-center">\n            <button \n              onClick=\{\(\) => setShowAdmin\(true\)\}\n              className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"\n            >\n              Akses Admin Panel\n            <\/button>\n          <\/div>/,
  "{user?.email === 'jrnabil570@gmail.com' && (\n          <div className=\"flex justify-center\">\n            <button \n              onClick={() => setShowAdmin(true)}\n              className=\"text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors\"\n            >\n              Akses Admin Panel\n            </button>\n          </div>\n          )}"
);

fs.writeFileSync('src/App.tsx', code);
