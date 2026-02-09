# 🗄️ Migração: SQLite → PostgreSQL

## Por que Migrar?

| Aspecto | SQLite | PostgreSQL |
|--------|--------|-----------|
| **Escala** | Local | Remoto + Cloud |
| **Concorrência** | Limitada | Excelente |
| **Conexões** | Uma | Múltiplas |
| **Cloud** | Não funciona | ✅ Perfeito |
| **Backups** | Manual | Automático |
| **Replicação** | Não | ✅ Sim |

---

## 📋 Passo 1: Criar Banco PostgreSQL

### Opção A: Railway (Recomendado)

```bash
# 1. Vá para https://railway.app
# 2. Crie novo projeto
# 3. Selecione "PostgreSQL"
# 4. Copie DATABASE_URL

# Terá algo assim:
# postgresql://user:pass@containers-us-west-123.railway.app:5432/databasename
```

### Opção B: Supabase

```bash
# 1. Vá para https://supabase.com
# 2. Crie novo projeto
# 3. Copie DATABASE_URL no settings
```

---

## 🔄 Passo 2: Preparar Backend para PostgreSQL

### Instalar Driver PostgreSQL

```bash
cd backend
npm install pg
npm install --save-dev sequelize-cli  # Opcional, para migrations
```

### Criar arquivo `src/database-postgres.js`

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Erro no pool PostgreSQL:', err);
});

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve({ 
        lastID: result.rows[0]?.id, 
        changes: result.rowCount 
      });
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

const initializeDatabase = async () => {
  try {
    // Tabela de usuários
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de senhas/tickets
    await dbRun(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        ticket_number INTEGER NOT NULL,
        status TEXT DEFAULT 'aberto',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        called_at TIMESTAMP,
        completed_at TIMESTAMP,
        admin_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (admin_id) REFERENCES users(id)
      )
    `);

    // Tabela de sesiones de admin
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id TEXT PRIMARY KEY,
        admin_id TEXT NOT NULL,
        counter_number INTEGER,
        current_ticket_id TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id),
        FOREIGN KEY (current_ticket_id) REFERENCES tickets(id)
      )
    `);

    // Tabela de logs/auditoria
    await dbRun(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        admin_id TEXT,
        action TEXT NOT NULL,
        ticket_id TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id),
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)
      )
    `);

    console.log('✓ Tabelas PostgreSQL criadas/verificadas');
  } catch (error) {
    console.error('Erro ao inicializar database:', error);
    throw error;
  }
};

const getNextTicketNumber = async () => {
  const result = await dbGet(
    `SELECT MAX(ticket_number) as max_number 
     FROM tickets 
     WHERE DATE(created_at) = CURRENT_DATE`,
    []
  );
  
  return (result?.max_number || 0) + 1;
};

module.exports = {
  dbRun,
  dbGet,
  dbAll,
  initializeDatabase,
  getNextTicketNumber,
  pool
};
```

### Atualizar `src/database.js`

```javascript
// Selecionar driver baseado em NODE_ENV
const database = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL
  ? require('./database-postgres')
  : require('./database-sqlite');

module.exports = database;
```

---

## 📊 Passo 3: Exportar Dados do SQLite

### Script para Exportar

```bash
cat > backend/scripts/migrate-sqlite-to-postgres.js << 'EOF'
#!/usr/bin/env node

const sqlite = require('sqlite3');
const { Pool } = require('pg');

const sqliteDb = new sqlite.Database('./data/filavirtual.db');
const postgresPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    console.log('🔄 Iniciando migração SQLite → PostgreSQL...\n');

    // 1. Migrar usuários
    console.log('📝 Migrando usuários...');
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    for (const user of users) {
      await postgresPool.query(
        'INSERT INTO users (id, name, email, phone, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.id, user.name, user.email, user.phone, user.password, user.role, user.created_at]
      );
    }
    console.log(`✓ ${users.length} usuários migrados`);

    // 2. Migrar tickets
    console.log('📝 Migrando tickets...');
    const tickets = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM tickets', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    for (const ticket of tickets) {
      await postgresPool.query(
        `INSERT INTO tickets (id, user_id, ticket_number, status, created_at, called_at, completed_at, admin_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [ticket.id, ticket.user_id, ticket.ticket_number, ticket.status, ticket.created_at, ticket.called_at, ticket.completed_at, ticket.admin_id]
      );
    }
    console.log(`✓ ${tickets.length} tickets migrados`);

    // 3. Migrar audit logs
    console.log('📝 Migrando logs...');
    const logs = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM audit_logs', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    for (const log of logs) {
      await postgresPool.query(
        'INSERT INTO audit_logs (id, admin_id, action, ticket_id, details, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [log.id, log.admin_id, log.action, log.ticket_id, log.details, log.created_at]
      );
    }
    console.log(`✓ ${logs.length} logs migrados`);

    console.log('\n✅ Migração concluída!');
    
    await postgresPool.end();
    sqliteDb.close();
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrate();
EOF

chmod +x backend/scripts/migrate-sqlite-to-postgres.js
```

### Executar Migração

```bash
# Com variável de ambiente
DATABASE_URL="postgresql://user:pass@host/db" node backend/scripts/migrate-sqlite-to-postgres.js

# Resultado esperado:
# 🔄 Iniciando migração SQLite → PostgreSQL...
# 📝 Migrando usuários...
# ✓ 5 usuários migrados
# 📝 Migrando tickets...
# ✓ 42 tickets migrados
# 📝 Migrando logs...
# ✓ 128 logs migrados
# ✅ Migração concluída!
```

---

## 🧪 Passo 4: Testar Conexão

### Criar script de teste

```bash
cat > backend/scripts/test-postgres.js << 'EOF'
#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    console.log('🧪 Testando conexão PostgreSQL...\n');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Conexão OK!');
    console.log('Timestamp:', result.rows[0].now);
    
    const countUsers = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Usuários no DB:', countUsers.rows[0].count);
    
    const countTickets = await pool.query('SELECT COUNT(*) FROM tickets');
    console.log('Senhas no DB:', countTickets.rows[0].count);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

test();
EOF

chmod +x backend/scripts/test-postgres.js
```

### Executar teste

```bash
DATABASE_URL="postgresql://user:pass@host/db" node backend/scripts/test-postgres.js
```

---

## 🚀 Passo 5: Deploy com PostgreSQL

### Atualizar backend/package.json

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "migrate": "node scripts/migrate-sqlite-to-postgres.js",
    "test-db": "node scripts/test-postgres.js"
  }
}
```

### No Railway/Vercel

1. Remova banco SQLite
2. Adicione PostgreSQL
3. Configure `DATABASE_URL`
4. Deploy
5. Execute migração se necessário

---

## 🔄 Passo 6: Rollback (Se Necessário)

Se tudo der errado:

```bash
# 1. Voltar para SQLite
git checkout backend/src/database.js

# 2. Redeploy
git push

# 3. Vercel/Railway detecta e redeploy automaticamente
```

---

## 📊 Comparação SQL - SQLite vs PostgreSQL

### Diferenças de Sintaxe

| Operação | SQLite | PostgreSQL |
|----------|--------|-----------|
| **UUID** | TEXT | uuid |
| **Boolean** | 0/1 | true/false |
| **Timestamp** | DATETIME | TIMESTAMP |
| **Auto-increment** | AUTOINCREMENT | SERIAL |
| **JSON** | TEXT | JSONB |

### Exemplo: Criar Tabela

**SQLite:**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**PostgreSQL:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ Checklist de Migração

- [ ] PostgreSQL criado (Railway/Supabase)
- [ ] DATABASE_URL obtida
- [ ] Driver `pg` instalado
- [ ] `database-postgres.js` criado
- [ ] `database.js` atualizado
- [ ] Script de migração criado
- [ ] Dados exportados do SQLite
- [ ] Conexão testada
- [ ] Deploy realizado
- [ ] Produção testada

---

## 📞 Troubleshooting

### Erro: "Connection refused"
```
Error: connect ECONNREFUSED
```
Solução: Verificar DATABASE_URL e conexão de rede

### Erro: "Permission denied"
```
Error: permission denied for schema public
```
Solução: Usuário não tem permissões. Verificar credentials

### Erro: "Replication lag"
```
Could not serialize access due to concurrent update
```
Solução: Normal em alta concorrência. Implementar retry logic

---

## 🎓 Exemplo Completo

```bash
# 1. Preparar
npm install pg

# 2. Criar arquivo database-postgres.js (veja acima)

# 3. Migrar dados
DATABASE_URL="...sua-url..." npm run migrate

# 4. Testar
DATABASE_URL="...sua-url..." npm run test-db

# 5. Deploy
git add .
git commit -m "Migrate to PostgreSQL"
git push

# 6. Vercel/Railway autodeploy ✨
```

---

**Migração completa! Banco de dados em produção 🎉**
