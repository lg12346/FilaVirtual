# 🚀 Guia Completo de Deploy na Vercel

## ⚠️ Considerações Importantes

### Por que Vercel?
- ✅ Deploy automático no push
- ✅ HTTPS grátis
- ✅ CDN global
- ✅ Plano gratuito generoso
- ✅ Suporte a Node.js

### Limitações a Conhecer
- ⚠️ Vercel é **serverless** (não ideal para banco de dados SQLite local)
- ⚠️ Não persiste arquivos entre deploys
- ⚠️ Timeout máximo: 60s (plano gratuito), 900s (pro)

### Solução Recomendada
Para este projeto, vamos usar:
- **Frontend**: Vercel (Build estático) ✨
- **Backend**: Vercel + Supabase (PostgreSQL) 🗄️
- **Alternativa**: Railway.app ou Fly.io para backend

---

## 📋 Opção 1: Deploy Completo (Recomendado)

### Frontend no Vercel + Backend no Railway

#### Passo 1: Preparar o Projeto

```bash
# Navegue para o diretório raiz
cd /workspaces/FilaVirtual

# Inicialize repositório Git (se não estiver inicializado)
git init
git add .
git commit -m "Initial commit: Fila Virtual"

# Crie repositório no GitHub
# Vá para https://github.com/new
# Crie: FilaVirtual
# Copie a URL e execute:

git remote add origin https://github.com/SEU_USUARIO/FilaVirtual.git
git branch -M main
git push -u origin main
```

#### Passo 2: Criar Arquivo vercel.json (Frontend)

```bash
# Na raiz do projeto
cat > frontend/vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "REACT_APP_API_URL": "@react_app_api_url",
    "REACT_APP_SOCKET_URL": "@react_app_socket_url"
  }
}
EOF
```

#### Passo 3: Deploy do Frontend na Vercel

```bash
# 1. Vá para https://vercel.com
# 2. Clique em "New Project"
# 3. Selecione "Import Git Repository"
# 4. Cole: https://github.com/SEU_USUARIO/FilaVirtual
# 5. Clique em "Import"

# Configure o projeto:
# - Framework: React
# - Root Directory: ./frontend
# - Build Command: npm run build
# - Output Directory: build
# - Install Command: npm install

# Variáveis de Ambiente (não coloque ainda)
```

#### Passo 4: Backend no Railway (Alternativa ao Vercel)

Rails é melhor para Node + Database

**No Railway.app:**

```bash
# 1. Vá para https://railway.app
# 2. Clique em "New Project"
# 3. Selecione "Deploy from GitHub"
# 4. Conecte sua conta GitHub
# 5. Selecione o repositório FilaVirtual

# Configure:
# - Root Directory: ./backend
# - Start Command: npm start
# - Build Command: npm install

# Variáveis de Ambiente:
DATABASE_URL=postgresql://...  # Será fornecida pelo Railway
JWT_SECRET=<gere_com_openssl>
NODE_ENV=production
FRONTEND_URL=https://seu-frontend.vercel.app
```

#### Passo 5: Conectar Frontend e Backend

Após o deploy do backend, você terá uma URL (ex: https://seu-backend-railway.up.railway.app)

**No Vercel (Frontend):**

```
Settings → Environment Variables

REACT_APP_API_URL = https://seu-backend-railway.up.railway.app/api
REACT_APP_SOCKET_URL = https://seu-backend-railway.up.railway.app
```

Depois clique em "Deploy" para atualizar.

---

## 🔄 Opção 2: Deploy Apenas Frontend na Vercel (Simples)

Se já tem backend rodando em outro lugar:

#### Passo 1: Crie Repositório GitHub

```bash
cd /workspaces/FilaVirtual
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU_USUARIO/FilaVirtual.git
git push -u origin main
```

#### Passo 2: Conectar à Vercel

1. Vá para **https://vercel.com**
2. Clique em **"New Project"** ou **"Add New..."**
3. Selecione **"Import Git Repository"**
4. Cole: `https://github.com/SEU_USUARIO/FilaVirtual`
5. Clique em **"Import"**

#### Passo 3: Configurar Projeto

| Campo | Valor |
|-------|-------|
| **Framework** | React |
| **Root Directory** | `./frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

#### Passo 4: Variáveis de Ambiente

Antes de clicar "Deploy", adicione:

```
REACT_APP_API_URL=http://SEU_BACKEND_URL/api
REACT_APP_SOCKET_URL=http://SEU_BACKEND_URL
```

#### Passo 5: Deploy

Clique em **"Deploy"** e espere ~2-3 minutos

**Resultado:** https://seu-projeto.vercel.app

---

## 🗄️ Opção 3: Backend no Vercel (Com Supabase)

Para rodas backend na Vercel com banco de dados:

### Passo 1: Criar Conta Supabase

1. Vá para https://supabase.com
2. Clique em "Start your project"
3. Sign up com GitHub
4. Crie novo projeto
5. Copie `DATABASE_URL`

### Passo 2: Criar arquivo vercel.json (Backend)

```bash
cat > backend/vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ],
  "env": {
    "JWT_SECRET": "@jwt_secret",
    "DATABASE_URL": "@database_url"
  }
}
EOF
```

### Passo 3: Modificar Backend para Vercel

Edit `backend/src/index.js`:

```javascript
// Adicione no final do arquivo, antes de module.exports
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
}
```

### Passo 4: Deploy Backend

```bash
# Instale Vercel CLI
npm i -g vercel

# Na raiz do projeto
cd backend
vercel --prod
```

### Passo 5: Configurar Variáveis

```bash
vercel env add JWT_SECRET
# Insira seu JWT_SECRET

vercel env add DATABASE_URL
# Insira URL do Supabase

vercel redeploy --prod
```

---

## 📝 Atualizar database.js para Produção

Se usar Supabase ou PostgreSQL:

```bash
cat > backend/src/database-prod.js << 'EOF'
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve({ lastID: null, changes: result.rowCount });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result.rows[0]);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result.rows);
    });
  });
};

module.exports = { dbRun, dbGet, dbAll };
EOF
```

---

## 🔑 Variáveis de Ambiente - Resumo

### Frontend (Vercel)

```
REACT_APP_API_URL=https://seu-backend.vercel.app/api
REACT_APP_SOCKET_URL=https://seu-backend.vercel.app
```

### Backend (Railway ou Vercel)

```
PORT=3000
JWT_SECRET=<gere_com_openssl> ⚠️ SEGURO!
FRONTEND_URL=https://seu-frontend.vercel.app
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host/db  # Se usar Postgres
```

#### Gerar JWT_SECRET Seguro

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Resultado exemplo:
# rGvP+q8x2L9mN3kW5sT/J0aB7cD4eF1hI6jK2oP9qR8t
```

---

## ✅ Checklist de Deploy

### Antes do Deploy
- [ ] Repositório criado no GitHub
- [ ] Todos os arquivos commitados
- [ ] .env adicionado ao .gitignore
- [ ] JWT_SECRET gerado
- [ ] CORS configurado para domínio real

### Frontend (Vercel)
- [ ] Projeto importado
- [ ] Root directory: `./frontend`
- [ ] Build command: `npm run build`
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy realizado

### Backend (Railway)
- [ ] Projeto criado
- [ ] Banco PostgreSQL adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] URL do backend conhecida
- [ ] Atualizadas no frontend

### Teste Final
- [ ] Frontend carrega: https://seu-frontend.vercel.app
- [ ] Backend responde: https://seu-backend.test/api/health
- [ ] WebSocket conecta
- [ ] Autenticação funciona
- [ ] Senhas funcionam

---

## 🧪 Testar Após Deploy

### 1. Frontend
```bash
# Vá para https://seu-frontend.vercel.app
# Verifique se carrega sem erros
# Abra DevTools (F12) → Console
# Não deve haver erros CORS
```

### 2. Backend
```bash
curl https://seu-backend.vercel.app/api/health
# Resposta esperada: {"status":"ok","timestamp":"..."}
```

### 3. Conectar Cliente-Servidor
```bash
# 1. Abra https://seu-frontend.vercel.app/admin
# 2. Console (F12) → Network → WS
# 3. Deve conectar ao WebSocket
```

---

## 🐛 Troubleshooting

### Erro: "CORS error"
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```

**Solução:**
```javascript
// backend/src/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Erro: "Cannot find module"
```
Error: Cannot find module 'express'
```

**Solução:**
```bash
# Verifique se package.json está no . raiz do backend
cd backend
npm install
npm list express
```

### Erro: "database is locked" (SQLite)

**Motivo:** SQLite não funciona em Vercel (sistema de arquivos efêmero)

**Solução:** Migre para PostgreSQL (Supabase ou Railway)

### Erro: "Cannot GET /api/..."

**Solução:**
Verificar se:
1. Backend está rodando (`/api/health` responde)
2. FRONTEND_URL está correto
3. API_URL no frontend aponta para backend certo

### WebSocket não conecta

**Solução:**
```javascript
// frontend/src/services/api.js (ou onde usar socket)
const socket = io(process.env.REACT_APP_SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling']  // Adicione 'polling'
});
```

---

## 📊 Comparação de Plataformas

| Plataforma | Frontend | Backend | Custo | Notas |
|-----------|----------|---------|-------|-------|
| **Vercel** | ✅ Ótimo | ⚠️ OK | Grátis | Melhor para static |
| **Railway** | ✅ Bom | ✅ Excelente | $5/mês | Perfeito para Node.js |
| **Fly.io** | ✅ Bom | ✅ Excelente | $0 | Global + free tier |
| **Heroku** | ✅ Bom | ✅ Bom | $0 (descontinuado) | Não recomendado |

---

## 🎯 Plano Recomendado (Melhor Relação)

```
Frontend:    Vercel (Grátis)
Backend:     Railway (Grátis + $5/mês Pro)
Database:    PostgreSQL Railway (Incluído)
DNS:         Seu domínio
Total:       ~$5/mês ou Grátis
```

---

## 📱 Domínio Customizado (Opcional)

### Vercel Frontend

1. Vá para **Vercel Settings → Domains**
2. Clique em "Add Domain"
3. Insira: `seu-dominio.com`
4. Copie os nameservers
5. Atualize seu registrador DNS

### Railway Backend

1. Vá para **Railway Settings → Domains**
2. Clique em "Add Domain"
3. Insira: `api.seu-dominio.com`
4. Configure DNS

---

## 🔄 Workflow de Deploy Contínuo

### GitHub → Vercel (Automático)

```bash
# Após fazer commit e push
git add .
git commit -m "Nova feature"
git push origin main

# Vercel automaticamente:
# 1. Detecta novo push
# 2. Faz build
# 3. Testa
# 4. Deploy (se passar)
# 5. Enviam link de preview
```

### GitHub → Railway (Automático)

Mesmo processo que Vercel!

---

## 💾 Backup do Banco de Dados

Se usar Supabase/Railway PostgreSQL:

```bash
# Exportar dados
pg_dump postgresql://user:pass@host/db > backup.sql

# Importar dados
psql postgresql://user:pass@host/db < backup.sql
```

---

## 🎓 Resumo Final

```
1️⃣  GitHub: Código versionado
2️⃣  Vercel: Frontend hospedado
3️⃣  Railway: Backend + PostgreSQL hospedados
4️⃣  Seu domínio: Frontend + API customizados
5️⃣  Deploy: Automático a cada push

Resultado: Aplicação profissional, escalável e mantida!
```

---

## 📞 Suporte Vercel

- Docs: https://vercel.com/docs
- Community: https://vercel.com/community
- Status: https://www.vercelstatus.com

---

**Pronto para fazer deploy? 🚀**

Próximo passo: Copie um dos comandos de deploy e execute!
