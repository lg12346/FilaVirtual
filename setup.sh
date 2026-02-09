#!/bin/bash

# Fila Virtual - Script de Setup e Execução

echo "🎯 Fila Virtual - Setup Automático"
echo "=================================="

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Node está instalado
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js não está instalado. Por favor, instale Node.js v14+${NC}"
    exit 1
fi

echo -e "${BLUE}✓ Node.js detectado: $(node -v)${NC}"

# Menu
echo -e "\n${BLUE}Escolha uma opção:${NC}"
echo "1) Instalar dependências"
echo "2) Iniciar em desenvolvimento (npm run dev)"
echo "3) Iniciar backend apenas"
echo "4) Iniciar frontend apenas"
echo "5) Limpar node_modules e reinstalar"
echo "6) Build frontend para produção"
echo "7) Ver status das portas"

read -p "Opção: " option

case $option in
    1)
        echo -e "\n${BLUE}Instalando dependências...${NC}"
        npm install
        cd backend && npm install && cd ..
        cd frontend && npm install && cd ..
        echo -e "${GREEN}✓ Dependências instaladas com sucesso!${NC}"
        ;;
    2)
        echo -e "\n${BLUE}Iniciando aplicação em desenvolvimento...${NC}"
        echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
        echo -e "${YELLOW}Backend: http://localhost:5000${NC}"
        npm run dev
        ;;
    3)
        echo -e "\n${BLUE}Iniciando backend...${NC}"
        echo -e "${YELLOW}Backend: http://localhost:5000${NC}"
        cd backend && npm run dev
        ;;
    4)
        echo -e "\n${BLUE}Iniciando frontend...${NC}"
        echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
        cd frontend && npm start
        ;;
    5)
        echo -e "\n${YELLOW}Limpando node_modules...${NC}"
        rm -rf node_modules backend/node_modules frontend/node_modules
        echo -e "${BLUE}Reinstalando...${NC}"
        npm install
        cd backend && npm install && cd ..
        cd frontend && npm install && cd ..
        echo -e "${GREEN}✓ Reinstalação concluída!${NC}"
        ;;
    6)
        echo -e "\n${BLUE}Buildando frontend para produção...${NC}"
        cd frontend
        npm run build
        echo -e "${GREEN}✓ Build concluído em frontend/build${NC}"
        ;;
    7)
        echo -e "\n${BLUE}Verificando status das portas...${NC}"
        if command -v lsof &> /dev/null; then
            echo "Porta 5000 (Backend):"
            lsof -i :5000 || echo "  Disponível"
            echo "Porta 3000 (Frontend):"
            lsof -i :3000 || echo "  Disponível"
        else
            echo "Teste de conexão:"
            echo "Backend:"
            curl -s http://localhost:5000/api/health 2>/dev/null && echo "" || echo "  Indisponível"
            echo "Frontend:"
            curl -s http://localhost:3000 2>/dev/null > /dev/null && echo "  Disponível" || echo "  Indisponível"
        fi
        ;;
    *)
        echo -e "${YELLOW}Opção inválida${NC}"
        ;;
esac

echo -e "\n${GREEN}Pronto! ${NC}"
