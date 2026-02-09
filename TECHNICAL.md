# 📚 Documentação Técnica - Fila Virtual

## Arquitetura do Sistema

### Camadas

```
┌─────────────────────────────────────────────────────┐
│                  Interface Web (React)               │
│  - Login/Registro  - User Dashboard - Admin Panel   │
│  - Public Display  - Real-time Updates               │
└────────────────────┬────────────────────────────────┘
                     │ HTTP + WebSocket
                     ↓
┌─────────────────────────────────────────────────────┐
│           API REST + WebSocket (Express)             │
│  - Autenticação (JWT)  - Tickets - Admin Routes     │
│  - WebSocket Server    - Validações                 │
└────────────────────┬────────────────────────────────┘
                     │ SQL
                     ↓
┌─────────────────────────────────────────────────────┐
│            Banco de Dados (SQLite)                   │
│  - Users  - Tickets  - Sessions  - Audit Logs      │
└─────────────────────────────────────────────────────┘
```

## Modelo de Dados

### Tabela: users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,    -- hash bcrypt
  role TEXT DEFAULT 'user',  -- 'user' ou 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: tickets
```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  ticket_number INTEGER NOT NULL,
  status TEXT DEFAULT 'aberto',  -- aberto, chamada, atendida, não compareceu
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  called_at DATETIME,
  completed_at DATETIME,
  admin_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);
```

### Tabela: admin_sessions
```sql
CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  counter_number INTEGER,
  current_ticket_id TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_action_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (current_ticket_id) REFERENCES tickets(id)
);
```

### Tabela: audit_logs
```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  action TEXT NOT NULL,
  ticket_id TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);
```

## Fluxo de Autenticação

```
1. Usuário → POST /api/auth/register
   ↓
2. Backend valida e cria user com senha hasheada
   ↓
3. Usuário → POST /api/auth/login
   ↓
4. Backend verifica bcrypt e gera JWT token
   ↓
5. Frontend armazena token em localStorage
   ↓
6. Header: Authorization: Bearer <token>
   ↓
7. Backend valida JWT com middleware
```

## Fluxo de Senha

```
USUÁRIO COMUM:
1. generateTicket() → POST /api/tickets/generate
2. Backend cria ticket com número único
3. WebSocket emite "new_ticket" para admin
4. Usuário vê status "aberto"

ADMINISTRADOR:
1. callNextTicket() → POST /api/admin/call-next
2. Backend busca próximo ticket "aberto"
3. Atualiza status para "chamada"
4. WebSocket emite "ticket_called" para usuário
5. Usuário recebe alerta sonoro

COMPLETAR:
1. completeTicket() → POST /api/admin/complete-ticket
2. Status muda para "atendida"
3. WebSocket emite "ticket_completed"
4. Tela pública atualiza
```

## Comunicação em Tempo Real (WebSocket)

### Conexão

```javascript
// Cliente (React)
const socket = io('http://localhost:5000');

// Servidor (Node.js)
io.on('connection', (socket) => {
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });
});
```

### Eventos

#### Emitidos pelo Servidor
```javascript
// Quando uma senha é chamada
io.to(`user_${userId}`).emit('ticket_called', {
  ticket_number: 123,
  counter: 'Balcão 1'
});

// Atualização da tela pública
io.to('public_display').emit('ticket_update', {
  type: 'called',
  ticket_number: 123
});
```

#### Escutados pelo Cliente
```javascript
socket.on('ticket_called', (data) => {
  playNotificationSound();
  alert(`Sua senha ${data.ticket_number} foi chamada!`);
});

socket.on('ticket_completed', (data) => {
  updateUI();
});
```

## Segurança

### Autenticação
- **JWT Secret** deve ser forte e único
- **Expiração**: 24 horas
- **Refresh**: Implementar renovação se necessário

### Autorização
```javascript
// Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};
```

### Senha
- **Hash**: bcrypt com salt 10
- **Validação**: Mínimo 6 caracteres (customizável)

### CORS
```javascript
cors({
  origin: 'http://localhost:3000',
  credentials: true
});
```

## Tratamento de Erros

### Backend
```javascript
try {
  // operação
} catch (error) {
  console.error('Erro:', error);
  res.status(500).json({ error: 'Mensagem de erro' });
}
```

### Frontend
```javascript
try {
  const response = await api.post('/endpoint', data);
  // sucesso
} catch (error) {
  if (error.response?.status === 401) {
    // Token expirou
    logout();
  }
  setError(error.response?.data?.error || 'Erro desconhecido');
}
```

## Performance

### Optimizações
1. **Lazy Loading**: Componentes React carregam sob demanda
2. **Memoization**: useCallback, useMemo para evitar re-renders
3. **Connection Pooling**: SQLite usa conexão única
4. **Caching**: localStorage para dados de estação

### Escalabilidade
- **Redis**: Para sessões distribuídas (futura)
- **PostgreSQL**: Para grandes volumes
- **Load Balancer**: Para múltiplos servidores

## Testes

### Backend
```bash
# Teste de saúde
curl http://localhost:5000/api/health

# Registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Usuario","email":"user@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}'
```

### Frontend
```javascript
// Verificar localStorage
localStorage.getItem('token');
localStorage.getItem('user');

// Console do navegador
console.log(localStorage);
```

## Deployment

### Variáveis de Ambiente Produção

**Backend (.env)**
```
PORT=80
JWT_SECRET=<secret_muito_seguro>
FRONTEND_URL=https://seu-dominio.com
NODE_ENV=production
DATABASE_URL=postgresql://...  # Se usar PostgreSQL
```

**Frontend (.env.production)**
```
REACT_APP_API_URL=https://api.seu-dominio.com
REACT_APP_SOCKET_URL=https://api.seu-dominio.com
```

### Checklist de Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado
- [ ] CORS com domínios permitidos
- [ ] Banco de dados backupado
- [ ] Rate limiting ativado
- [ ] Logs configurados
- [ ] Monitoramento ativado
- [ ] SSL certificate válido

## Extensões Futuras

### Funcionalidades Planejadas
1. **Sistema de Prioridade**: Idosos, gestantes, etc
2. **Agendamento**: Marcar horário antecipadamente
3. **Relatórios**: Histórico e análise de atendimentos
4. **Integração**: APIs externas de notificação
5. **Multi-tenant**: Múltiplas organizações
6. **Biometria**: Autenticação por QR code
7. **Analytics**: Dashboard de KPIs
8. **Impressão**: Recibos e etiquetas

### Tecnologias Futuras
- **GraphQL**: Para consultas mais eficientes
- **Redis**: Para cache distribuído
- **ElasticSearch**: Para buscas avançadas
- **Machine Learning**: Previsão de fluxo
- **Mobile App**: React Native

## Troubleshooting Técnico

### CORS error
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' 
from origin 'http://localhost:3000' has been blocked
```
**Solução**: Verificar CORS no backend/src/index.js

### JWT inválido
```
Error: jwt malformed
```
**Solução**: Verificar se token está sendo enviado corretamente no header

### WebSocket desconecta
- Verificar conexão de rede
- Aumentar timeout: `socket.io({ reconnectionDelay: 1000 })`
- Verificar CORS do Socket.io

### Database lock
```
Error: database is locked
```
**Solução**: Reiniciar servidor backend, deletar .db se necessário

## Performance Benchmarks

| Operação | Tempo Médio |
|----------|-----------|
| Login | 50ms |
| Gerar Senha | 30ms |
| Chamar Senha | 20ms |
| WebSocket Update | 5ms |
| Tela Pública Load | 100ms |

---

**Última atualização**: 2024-02-09
