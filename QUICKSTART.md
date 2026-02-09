# 🚀 Guia de Início Rápido - Fila Virtual

## Opção 1: Instalação Local (Recomendado para Desenvolvimento)

### Passo 1: Clonar/Acessar o Projeto
```bash
cd FilaVirtual
```

### Passo 2: Instalar Dependências
```bash
# Instalar dependências raiz
npm install

# Instalar dependências backend
cd backend
npm install
cd ..

# Instalar dependências frontend
cd frontend
npm install
cd ..
```

### Passo 3: Iniciar a Aplicação
```bash
# Na raiz do projeto
npm run dev
```

Isso abrirá:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Passo 4: Criar Conta de Teste

#### Admin
1. Vá para http://localhost:3000
2. Clique em "Não tem conta? Cadastre-se"
3. Preencha:
   - Nome: Admin
   - Email: admin@teste.com
   - Senha: admin123
4. Selecione "Administrador"
5. Clique em Cadastrar
6. Faça login
7. Acesso automático ao painel: http://localhost:3000/admin

#### Usuário Comum
1. Repita o processo acima
2. Na etapa 5, selecione "Usuário Comum"
3. Acesso automático ao painel: http://localhost:3000/user

---

## Opção 2: Docker (Recomendado para Produção)

### Pré-requisito
- Docker e Docker Compose instalados

### Executar
```bash
docker-compose up
```

A aplicação estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🎯 Testando o Sistema

### 1. Teste do Usuário Comum
```bash
# Em uma aba do navegador:
# 1. Abra http://localhost:3000
# 2. Faça login como usuário comum
# 3. Clique em "+ Gerar Nova Senha"
# 4. Sua senha foi criada!
# 5. Com a aba aberta, siga para o próximo teste
```

### 2. Teste do Administrador
```bash
# Em outra aba do navegador:
# 1. Abra http://localhost:3000/admin
# 2. Faça login como admin
# 3. Insira "1" no campo "Número do Balcão"
# 4. Clique em "📢 Chamar Próxima"
# 5. Volte para a aba do usuário comum
# 6. ✨ Você receberá uma notificação sonora de chamada!
```

### 3. Teste da Tela Pública
```bash
# Em uma terceira aba:
# 1. Abra http://localhost:3000/public
# 2. Esta tela mostra todas as movimentações
# 3. Quando chamar uma senha no painel admin, aparecerá em destaque
```

### 4. Teste Múltiplos Usuários
```bash
# Crie mais usuários e abra em abas diferentes
# Cada um pode gerar suas próprias senhas
# O painel admin coordena todos
```

---

## 🔧 Troubleshooting

### Erro: "EADDRINUSE: address already in use :::5000"
```bash
# Encontrar processo na porta
# Mac/Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000

# O resultado mostrará o PID, então:
# Mac/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

### Erro: "Cannot find module"
```bash
# Reinstale as dependências
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm run dev
```

### WebSocket não está conectando
1. Verifique se o backend está rodando (porta 5000)
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Reinicie o servidor backend

### Banco de dados corrompido
```bash
# Deleta o banco de dados e recria
rm backend/data/filavirtual.db
npm run dev
```

---

## 📊 Verificar Status

### Backend está rodando?
```bash
curl http://localhost:5000/api/health
# Resposta esperada: {"status":"ok","timestamp":"..."}
```

### Frontend está rodando?
```bash
# Abra http://localhost:3000 no navegador
```

---

## 🎓 Conceitos-Chave

### Fluxo de senha
1. **Usuário gera** → POST /api/tickets/generate
2. **Ticket criado** → Status: "aberto"
3. **Admin chama** → PATCH status → "chamada"
4. **Usuário recebe alerta** → Socket.io event
5. **Admin confirma** → PATCH status → "atendida"

### Autenticação
- **JWT Token** armazenado em localStorage
- **Bearer Token** enviado em headers
- **Roles**: "user" ou "admin"

### Real-time
- **Socket.io** conecta cliente e servidor
- **Eventos**: ticket_called, ticket_completed, etc
- **Rooms**: Separação por usuário e admin

---

## 📝 Variáveis de Ambiente

### Backend (.env)
```
PORT=5000
JWT_SECRET=seu_secret_key_muito_seguro
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🎉 Parabéns!

Sua aplicação de gerenciamento de senhas está rodando! 

Próximos passos:
- [ ] Explorar o painel admin
- [ ] Testar notificações sonoras
- [ ] Abrir tela pública em TV/display
- [ ] Customizar cores/tema
- [ ] Fazer deploy em produção

---

## 📞 Suporte

Encontrou um problema? Verifique:
1. Readme.md para documentação completa
2. Logs do console (F12 no navegador)
3. Logs do servidor (terminal)
4. Repositório do GitHub para issues similares

---

**Desenvolvido para simplificar o atendimento ao público! 📋**
