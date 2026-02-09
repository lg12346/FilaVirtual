# 🚀 Rodando o Projeto Localmente

## ✅ Pré-requisitos
- **Node.js v14+** - [Instale aqui](https://nodejs.org)
- **npm** (já vem com Node.js)

## 🎯 Quick Start (Forma Mais Rápida)

### Passo 1: Instalar dependências
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Passo 2: Iniciar o projeto
```bash
npm run dev
```

**Pronto! 🎉**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend: http://localhost:5000

---

## 📌 Alternativas e Opções

### Iniciar separadamente

**Backend apenas:**
```bash
cd backend
npm run dev
```
Acesse: http://localhost:5000/api/health

**Frontend apenas:**
```bash
cd frontend
npm start
```
Acesse: http://localhost:3000

### Build para produção
```bash
cd frontend
npm run build
```
Os arquivos compilados estarão em `frontend/build/`

---

## 🔑 Variáveis de Ambiente

O backend já tem um arquivo `.env` configurado para desenvolvimento local. Se precisar alterar:

**Arquivo:** `backend/.env`

```env
PORT=5000
JWT_SECRET=seu_secret_key_muito_seguro_aqui_2024
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

⚠️ **Em Produção:** Mude o `JWT_SECRET` para algo mais seguro!

---

## 🗄️ Banco de Dados

O projeto usa **SQLite** (arquivo local). O banco é criado automaticamente em:
```
backend/data/filavirtual.db
```

Nenhuma configuração adicional é necessária!

---

## 💡 Dicas Úteis

### Se der erro de porta em uso
```bash
# Mude a porta do backend no arquivo backend/.env
PORT=5001
```

### Se der erro de dependências
```bash
# Limpe e reinstale tudo
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm run dev
```

### Usar script interativo
```bash
bash setup.sh
```
Menu com opções como: instalar, iniciar, limpar, etc.

---

## 👤 Dados de Teste

### Admin (padrão do sistema)
- **Email:** admin@example.com
- **Senha:** admin123

Crie novos usuários durante o uso!

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| Porta 3000 já em uso | Mude em `frontend/.env` ou mate processo: `lsof -i :3000` |
| Porta 5000 já em uso | Mude em `backend/.env` |
| Erro ao conectar backend | Verifique se backend está rodando em :5000 |
| Banco de dados vazio | Banco cria automaticamente; faça login e crie dados |

---

## 📚 Recursos Adicionais

- [README Principal](./README.md) - Informações do projeto
- [QUICKSTART](./QUICKSTART.md) - Guia rápido geral
- [setup.sh](./setup.sh) - Script interativo de setup
