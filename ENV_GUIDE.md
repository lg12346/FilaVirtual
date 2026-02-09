# GUIA DE VARIÁVEIS DE AMBIENTE

## ⚠️ IMPORTANTE

Nunca commite arquivos .env para o repositório!
Os arquivos .env estão listados no .gitignore

## Backend - backend/.env

### Desenvolvimento
```bash
PORT=5000
JWT_SECRET=dev_secret_key_insecura_para_testes
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Produção
```bash
PORT=80                                          # Porta principal
JWT_SECRET=gerar_com_comando_openssl_abaixo    # ⛔ OBRIGATÓRIO - Substitua!
FRONTEND_URL=https://seu-dominio-frontend.com  # URL real do frontend
NODE_ENV=production
```

#### Gerar JWT_SECRET Seguro
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Node.js (qualquer SO)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Frontend - frontend/.env

### Desenvolvimento
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Produção
```bash
REACT_APP_API_URL=https://api.seu-dominio.com/api
REACT_APP_SOCKET_URL=https://seu-dominio.com
```

## Raiz - .env (Opcional)

```bash
# Configurações globais do projeto
ENVIRONMENT=development  # development | staging | production
LOG_LEVEL=info          # debug | info | warn | error
DEBUG=false
```

---

## 📋 Checklist de Variáveis

### Antes de Desenvolver
- [ ] Backend .env criado
- [ ] Frontend .env criado
- [ ] JWT_SECRET definido
- [ ] FRONTEND_URL correto

### Antes de Deploy
- [ ] JWT_SECRET alterado (não use padrão!)
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL aponta para domínio real
- [ ] SSL/HTTPS habilitado
- [ ] CORS configurado corretamente

---

## 🔐 Segurança

### Senhas Fortes
Exemplo de JWT_SECRET forte:
```
rGvP+q8x2L9mN3kW5sT/J0aB7cD4eF1hI6jK2oP9qR8t
```

### Revogação de Segredos
Se o JWT_SECRET vazar:
```bash
# 1. Altere o JWT_SECRET
# 2. Todos os tokens ativos se tornarão inválidos
# 3. Usuários precisarão fazer login novamente
# 4. Atualize em produção
```

### Variables Sensíveis NUNCA Compartilhe
- ❌ JWT_SECRET
- ❌ Database passwords
- ❌ API keys
- ❌ Private keys

---

## 🌍 URLs por Ambiente

| Variável | Desenvolvimento | Staging | Produção |
|----------|----------------|---------|----------|
| FRONTEND_URL | http://localhost:3000 | https://staging.seu-site.com | https://seu-site.com |
| REACT_APP_API_URL | http://localhost:5000/api | https://api.staging.seu-site.com/api | https://api.seu-site.com/api |
| NODE_ENV | development | staging | production |

---

## 📱 Variáveis Dinâmicas

### Se precisar de múltiplos ambientes:

```bash
# .env.local (gitignore)
# Para development local

# .env.staging
# Para ambiente de testes

# .env.production
# Para produção

# Carregar assim no código:
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});
```

---

## 🧪 Testar Variáveis

### Backend
```javascript
// No arquivo backend/src/index.js
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Configurado' : '✗ Faltando');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
```

### Frontend
```javascript
// No arquivo frontend/src/App.js
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('SOCKET URL:', process.env.REACT_APP_SOCKET_URL);
```

---

## 🚀 Deploy com Variáveis

### Heroku
```bash
# Definir variáveis
heroku config:set JWT_SECRET="seu_secret_aqui"
heroku config:set FRONTEND_URL="https://seu-frontend.herokuapp.com"
heroku config:set NODE_ENV="production"

# Verificar
heroku config
```

### AWS/EB
```bash
# Adicionar a .elasticbeanstalk/config.yml
environment_defaults:
  aws:elasticbeanstalk:application:environment:
    JWT_SECRET: seu_secret_aqui
    FRONTEND_URL: https://seu-dominio.com
```

### Docker
```bash
# docker-compose.yml
environment:
  - PORT=${PORT:-5000}
  - JWT_SECRET=${JWT_SECRET:-dev_key}
  - NODE_ENV=${NODE_ENV:-development}

# .env
PORT=5000
JWT_SECRET=prod_secret_seguro
NODE_ENV=production
```

---

**Leia antes de colocar em produção! 🔒**
