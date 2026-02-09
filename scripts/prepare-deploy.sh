#!/bin/bash

# 🚀 Script de Preparação para Deploy na Vercel

echo "🚀 Preparação para Deploy - Fila Virtual"
echo "========================================"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se Git está configurado
echo -e "\n${BLUE}1. Verificando Git...${NC}"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}Git não inicializado. Inicializando...${NC}"
    git init
    git add .
    git commit -m "Initial commit: Fila Virtual"
else
    echo -e "${GREEN}✓ Git já configurado${NC}"
fi

# Verificar se tem mudanças não commitadas
if ! git diff-index --quiet HEAD -- ; then
    echo -e "${YELLOW}⚠ Há mudanças não commitadas. Commit agora?${NC}"
    read -p "Fazer commit de todas as mudanças? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git add .
        git commit -m "Pre-deployment commit"
    fi
fi

# Verificar .env
echo -e "\n${BLUE}2. Verificando arquivos .env...${NC}"

if grep -q "backend/.env" .gitignore && grep -q "frontend/.env" .gitignore; then
    echo -e "${GREEN}✓ Arquivos .env estão no .gitignore${NC}"
else
    echo -e "${YELLOW}⚠ Adicionando .env ao .gitignore${NC}"
    echo "backend/.env" >> .gitignore
    echo "frontend/.env" >> .gitignore
    git add .gitignore
    git commit -m "Update .gitignore"
fi

# Gerar JWT_SECRET
echo -e "\n${BLUE}3. Gerando JWT_SECRET...${NC}"

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo -e "${GREEN}✓ JWT_SECRET gerado:${NC}"
echo -e "${YELLOW}$JWT_SECRET${NC}"
echo -e "\n${RED}⚠️  GUARDE ESTE VALOR! Você precisará na Vercel/Railway${NC}"

# Verificar package.json
echo -e "\n${BLUE}4. Verificando package.json...${NC}"

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json encontrado${NC}"
else
    echo -e "${RED}✗ package.json não encontrado${NC}"
    exit 1
fi

if [ -f "backend/package.json" ]; then
    echo -e "${GREEN}✓ backend/package.json encontrado${NC}"
else
    echo -e "${RED}✗ backend/package.json não encontrado${NC}"
    exit 1
fi

if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓ frontend/package.json encontrado${NC}"
else
    echo -e "${RED}✗ frontend/package.json não encontrado${NC}"
    exit 1
fi

# Sugerir próximos passos
echo -e "\n${BLUE}5. Próximos Passos${NC}"
echo "========================================"

echo -e "\n${YELLOW}Para Frontend na Vercel:${NC}"
echo "1. Vá para https://vercel.com"
echo "2. Clique em 'New Project'"
echo "3. Selecione 'Import Git Repository'"
echo "4. Cole sua URL GitHub"
echo "5. Configure:"
echo "   - Framework: React"
echo "   - Root Directory: ./frontend"
echo "   - Build Command: npm run build"
echo "6. Adicione variáveis de ambiente:"
echo "   REACT_APP_API_URL=<sua-url-backend>/api"
echo "   REACT_APP_SOCKET_URL=<sua-url-backend>"
echo "7. Deploy!"

echo -e "\n${YELLOW}Para Backend no Railway:${NC}"
echo "1. Vá para https://railway.app"
echo "2. Clique em 'New Project'"
echo "3. Selecione 'Deploy from GitHub'"
echo "4. Configure:"
echo "   - Root Directory: ./backend"
echo "   - Start Command: npm start"
echo "5. Adicione variáveis:"
echo "   JWT_SECRET=$JWT_SECRET"
echo "   FRONTEND_URL=<sua-url-frontend>"
echo "   NODE_ENV=production"
echo "6. Railway fornecerá DATABASE_URL"
echo "7. Deploy!"

echo -e "\n${GREEN}✓ Projeto pronto para deploy!${NC}"
echo -e "\n${BLUE}Documentação: Ver VERCEL_DEPLOY.md${NC}"
