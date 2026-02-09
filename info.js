#!/usr/bin/env node

/**
 * 📋 FILA VIRTUAL - Sistema de Gerenciamento de Senhas
 * 
 * Este script fornece informações sobre o projeto e ajuda no setup inicial
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  console.log('─'.repeat(60));
}

log('bright', '\n📋 FILA VIRTUAL - Sistema de Gerenciamento de Senhas\n');

separator();
log('blue', 'STATUS DO PROJETO');
separator();

// Verificar se node_modules existe
const backendNodeModules = fs.existsSync(path.join(__dirname, 'backend/node_modules'));
const frontendNodeModules = fs.existsSync(path.join(__dirname, 'frontend/node_modules'));

log(backendNodeModules ? 'green' : 'yellow', `Backend dependencies: ${backendNodeModules ? '✓ Instaladas' : '✗ Não instaladas'}`);
log(frontendNodeModules ? 'green' : 'yellow', `Frontend dependencies: ${frontendNodeModules ? '✓ Instaladas' : '✗ Não instaladas'}`);

separator();
log('blue', 'PRÓXIMOS PASSOS');
separator();

const steps = [
  '1. Instalar dependências:',
  '   npm install',
  '',
  '2. Instalar dependências do backend:',
  '   cd backend && npm install && cd ..',
  '',
  '3. Instalar dependências do frontend:',
  '   cd frontend && npm install && cd ..',
  '',
  '4. Iniciar aplicação em desenvolvimento:',
  '   npm run dev',
  '',
  '5. Abrir no navegador:',
  '   Frontend: http://localhost:3000',
  '   Backend: http://localhost:5000',
];

steps.forEach(step => {
  if (step.startsWith('cd ') || step === '' || step.match(/^   /)) {
    log('yellow', step);
  } else {
    log('bright', step);
  }
});

separator();
log('blue', 'ESTRUTURA DO PROJETO');
separator();

console.log(`
📁 FilaVirtual/
├── backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── index.js        # Servidor principal
│   │   ├── database.js     # SQLite
│   │   ├── middleware/
│   │   └── routes/
│   ├── package.json
│   ├── .env               # Variáveis de ambiente
│   └── Dockerfile
│
├── frontend/               # React + Socket.io
│   ├── public/
│   ├── src/
│   │   ├── pages/         # AuthPage, UserDashboard, AdminDashboard, PublicDisplay
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── services/      # API client
│   │   ├── styles/        # CSS
│   │   └── context/       # Authentication context
│   ├── package.json
│   ├── .env               # Variáveis de ambiente
│   └── Dockerfile
│
├── docker-compose.yml     # Setup Docker
├── package.json          # Scripts root
├── README.md             # Documentação completa
├── QUICKSTART.md         # Guia rápido
├── TECHNICAL.md          # Documentação técnica
├── ENV_GUIDE.md          # Guia de variáveis
└── LICENSE
`);

separator();
log('blue', 'RECURSOS ÚTEIS');
separator();

const resources = [
  { name: 'README.md', desc: 'Documentação completa com todas as features' },
  { name: 'QUICKSTART.md', desc: 'Guia rápido de início (COMECE AQUI!)' },
  { name: 'TECHNICAL.md', desc: 'Documentação técnica e arquitetura' },
  { name: 'ENV_GUIDE.md', desc: 'Guia de configuração de variáveis' },
];

resources.forEach(({ name, desc }) => {
  log('green', `✓ ${name}`);
  console.log(`  ${desc}`);
});

separator();
log('blue', 'SCRIPTS DISPONÍVEIS');
separator();

const scripts = [
  { cmd: 'npm run dev', desc: 'Inicia backend e frontend' },
  { cmd: 'npm run server', desc: 'Inicia apenas o backend' },
  { cmd: 'npm run client', desc: 'Inicia apenas o frontend' },
  { cmd: 'npm run build', desc: 'Build para produção' },
];

scripts.forEach(({ cmd, desc }) => {
  console.log(`${colors.yellow}${cmd}${colors.reset}`);
  console.log(`  ${desc}`);
});

separator();
log('blue', 'CREDENCIAIS DE TESTE');
separator();

console.log(`
📊 Administrador:
   Email: admin@teste.com
   Senha: admin123
   Acesso: http://localhost:3000/admin

👤 Usuário Comum:
   Email: usuario@teste.com
   Senha: senha123
   Acesso: http://localhost:3000/user

📺 Tela Pública:
   Acesso: http://localhost:3000/public
`);

separator();
log('blue', 'ARQUITETURA');
separator();

console.log(`
┌─────────────────────────────┐
│   React (Frontend)          │
│ ✓ Autenticação              │
│ ✓ Painel do Usuário         │
│ ✓ Painel do Admin           │
│ ✓ Tela Pública em Tempo Real│
└────────────┬────────────────┘
             │ HTTP + WebSocket
             ↓
┌─────────────────────────────┐
│   Express + Socket.io       │
│ ✓ API REST Segura (JWT)     │
│ ✓ WebSocket Real-time       │
│ ✓ Geração de Senhas         │
│ ✓ Painel Administrativo     │
└────────────┬────────────────┘
             │ SQL
             ↓
┌─────────────────────────────┐
│   SQLite Database           │
│ ✓ Usuários                  │
│ ✓ Senhas/Tickets            │
│ ✓ Logs de Auditoria         │
└─────────────────────────────┘
`);

separator();
log('green', '✨ Sistema pronto para desenvolvimento!\n');

log('yellow', '💡 Dica: Leia QUICKSTART.md para iniciar rapidamente');
log('yellow', '📖 Documentação completa em README.md\n');
