# 📋 Fila Virtual - Sistema de Gerenciamento de Senhas

Um sistema web completo e funcional para distribuição, gerenciamento e chamada de senhas em ambientes de atendimento ao público.

## 🎯 Características Principais

### 🔐 Autenticação e Perfis
- **Usuário Comum**: Pode se cadastrar, gerar senhas e acompanhar seu status em tempo real
- **Administrador**: Gerencia senhas, realiza chamadas e visualiza métricas

### ⚙️ Funcionalidades
- **Geração de Senhas**: Cada senha tem número único, data/hora e status
- **Painel Administrativo**: Chamar próxima ou específica senha, marcar conclusão
- **Notificações em Tempo Real**: WebSocket para atualizações instantâneas
- **Alertas Sonoros**: Notificação sonora ao chamar a senha
- **Tela Pública**: Display em tempo real com senhas sendo chamadas
- **Múltiplos Operadores**: Suporte para múltiplos admins ativos simultaneamente

### 📊 Status de Senhas
- ⏳ **Em Aberto** - Aguardando ser chamada
- 📢 **Chamada** - Sendo atendida
- ✅ **Atendida** - Atendimento concluído
- ❌ **Não Compareceu** - Usuário não apareceu

## 🛠️ Tecnologias

### Frontend
- **React 18** - Interface moderna e responsiva
- **React Router** - Navegação entre páginas
- **Socket.io Client** - Comunicação em tempo real
- **Axios** - Requisições HTTP

### Backend
- **Node.js + Express** - Servidor robusto
- **Socket.io** - WebSocket para real-time
- **SQLite** - Banco de dados leve
- **JWT** - Autenticação segura
- **bcryptjs** - Hash de senhas

## 📦 Instalação

### Pré-requisitos
- Node.js v14+ e npm

### Instalação Rápida

```bash
# Clone ou navegue até o diretório do projeto
cd FilaVirtual

# Instale todas as dependências (raiz, backend e frontend)
npm install

# Instale dependências do backend
cd backend && npm install && cd ..

# Instale dependências do frontend
cd frontend && npm install && cd ..
```

## 🚀 Iniciar Aplicação

### Desenvolvimento (Backend + Frontend)

```bash
# Na raiz do projeto
npm run dev
```

Isso iniciará:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Produção

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## 📋 Como Usar

### 1. Cadastro e Login

#### Usuário Comum
- Acesse http://localhost:3000
- Clique em "Não tem conta? Cadastre-se"
- Preencha: Nome, Email/Telefone, Senha
- Selecione "Usuário Comum"
- Confirme o cadastro

#### Administrador
- Cadastre-se da mesma forma
- Selecione "Administrador" no tipo de cadastro
- Use as credenciais para entrar no painel admin

### 2. Usuário Comum

- **Gerar Senha**: Clique em "+ Gerar Nova Senha"
- **Acompanhar Status**: Veja o status em tempo real (⏳ → 📢 → ✅)
- **Som de Alerta**: Série de bips quando sua senha é chamada
- **Ver Tela Pública**: Abra link para ver senhas sendo chamadas

### 3. Administrador

- **Acesso**: Página http://localhost:3000/admin
- **Painel de Controle**:
  - Insira número do balcão/atendimento
  - Clique "📢 Chamar Próxima" para chamar próxima senha em aberto
  - Ou clique "📢 Chamar" em senha específica
- **Gerenciamento**: Marque como "✅ Atendida" ou "❌ Não Compareceu"
- **Estatísticas**: Em tempo real no painel

### 4. Tela Pública

- Acesso: http://localhost:3000/public
- Mostra:
  - Grand total de senhas
  - Contadores por status
  - Última senha chamada (destaque)
  - Histórico recente

## 📁 Estrutura de Pastas

```
FilaVirtual/
├── backend/
│   ├── src/
│   │   ├── index.js              # Servidor principal
│   │   ├── database.js           # Configuração SQLite
│   │   ├── middleware/
│   │   │   └── auth.js          # Autenticação JWT
│   │   └── routes/
│   │       ├── auth.js          # Rotas de autenticação
│   │       ├── tickets.js       # Rotas de senhas
│   │       └── admin.js         # Rotas administrativas
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js               # Componente principal
│   │   ├── index.js             # Entry point React
│   │   ├── context/
│   │   │   └── AuthContext.js   # Contexto de autenticação
│   │   ├── hooks/
│   │   │   └── useSocket.js     # Hook customizado WebSocket
│   │   ├── pages/
│   │   │   ├── AuthPage.js      # Tela de login/registro
│   │   │   ├── UserDashboard.js # Painel do usuário
│   │   │   ├── AdminDashboard.js # Painel do admin
│   │   │   └── PublicDisplay.js # Tela pública
│   │   ├── services/
│   │   │   └── api.js           # Cliente HTTP
│   │   └── styles/
│   │       ├── index.css
│   │       ├── App.css
│   │       ├── AuthPage.css
│   │       ├── UserDashboard.css
│   │       ├── AdminDashboard.css
│   │       └── PublicDisplay.css
│   ├── .env
│   └── package.json
├── package.json
├── .env
└── README.md
```

## 🔑 Credenciais de Teste

### Usuário Comum
- Email: usuario@teste.com
- Senha: senha123

### Administrador
- Email: admin@teste.com
- Senha: admin123

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Cadastrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/profile` - Obter perfil (autenticado)

### Senhas
- `POST /api/tickets/generate` - Gerar nova senha
- `GET /api/tickets/current` - Obter senha atual
- `GET /api/tickets/history` - Histórico de senhas
- `GET /api/tickets/public` - Dados públicos de senhas

### Administrativo
- `GET /api/admin/tickets` - Listar todas as senhas
- `POST /api/admin/call-next` - Chamar próxima
- `POST /api/admin/call-specific` - Chamar específica
- `POST /api/admin/complete-ticket` - Marcar como atendida
- `POST /api/admin/no-show` - Marcar não compareceu
- `GET /api/admin/stats` - Estatísticas

## 🔔 Eventos WebSocket

### Emitidos pelo Backend
- `ticket_called` - Quando uma senha é chamada
- `ticket_completed` - Quando atendimento é finalizado
- `ticket_update` - Atualizações gerais
- `new_ticket` - Nova senha gerada

### Escutados pelo Frontend
- `join_user_room` - Conectar à sala de usuário
- `join_admin_room` - Conectar à sala de admin
- `join_public_display` - Conectar à tela pública

## 🎨 Customização

### Alterar CORS
Edit `backend/.env` e `backend/src/index.js`:
```javascript
FRONTEND_URL=https://seu-dominio.com
```

### Trocar Database
No `backend/src/database.js`, substitua SQLite por PostgreSQL ou MySQL:
```javascript
const db = new (require('pg')).Pool(config);
```

### Tema de Cores
Edite os arquivos CSS em `frontend/src/styles/`:
```css
/* Gradiente primário */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📱 Responsividade

O sistema é totalmente responsivo para:
- 💻 Desktop (1920px+)
- 📱 Tablet (768px - 1024px)
- 📞 Mobile (até 767px)

## 🔒 Segurança

- ✅ Senhas com hash bcrypt
- ✅ JWT para autenticação
- ✅ CORS configurado
- ✅ Validação de entrada
- ✅ Autorização por perfil (middleware)

## 🚀 Deploy

### Heroku
```bash
# Backend
heroku create seu-app-backend
heroku buildpacks:add heroku/nodejs
git push heroku main

# Frontend
npm run build
# Deploy estático (Netlify, Vercel, etc)
```

### Docker
```bash
docker-compose up
```

## 📝 Logs e Debugging

Visualize logs em tempo real:
```bash
# Backend
NODE_ENV=development npm run dev

# Frontend
npm start
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## � Deploy em Produção

Para colocar seu sistema em produção:

- **[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)** - Guia completo de deploy
- **[DEPLOY_PASSO_A_PASSO.txt](DEPLOY_PASSO_A_PASSO.txt)** - Visual step-by-step
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Migrar SQLite → PostgreSQL

### Resumo Rápido

```bash
# 1. Frontend na Vercel
git push origin main
# Vercel detecta e faz deploy automático

# 2. Backend no Railway
# Conecte seu GitHub repo
# Railway fará deploy automático

# 3. Conectar serviços
# Adicione variáveis de ambiente nos dashboards
```

**Resultado:** Aplicação profissional, escalável e mantida! 🎉

## �📄 Licença

MIT - Veja LICENSE para detalhes

## 🆘 Suporte e Troubleshooting

### Porta Já Está em Uso
```bash
# Linux/Mac
sudo lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Erro de Conexão do WebSocket
- Certifique-se de que backend está rodando
- Verifique CORS_ORIGIN no `.env`
- Limpe cache do navegador

### Banco de Dados Corrompido
```bash
rm backend/data/filavirtual.db
npm run dev
```

## 📞 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para melhorar a experiência de atendimento ao público**
