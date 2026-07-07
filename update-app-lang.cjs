const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ HistoryPanel, InfoPanel, AdminPanel, SidebarMenu, RatingPanel, AboutPanel, FeedbackPanel, UpdateModal \} from '\.\/components\/Panels';/, "import { HistoryPanel, InfoPanel, AdminPanel, SidebarMenu, RatingPanel, AboutPanel, FeedbackPanel, UpdateModal } from './components/Panels';\nimport { t } from './lib/i18n';");

code = code.replace(/Akses Admin Panel/g, "{t('Akses Admin Panel')}");
code = code.replace(/"Unduh"/g, "{t('Unduh')}");
code = code.replace(/"Sedang Memproses..."/g, "{t('Sedang Memproses...')}");
code = code.replace(/"Jam"/g, "{t('Jam')}");
code = code.replace(/"Menit"/g, "{t('Menit')}");
code = code.replace(/"Detik"/g, "{t('Detik')}");

fs.writeFileSync('src/App.tsx', code);
