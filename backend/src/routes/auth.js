const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validação
    if (!name || !password) {
      return res.status(400).json({ error: 'Nome e senha são obrigatórios' });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email ou telefone é obrigatório' });
    }

    // Verificar se usuário já existe
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email || null, phone || null]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const userRole = role === 'admin' ? 'admin' : 'user';

    await dbRun(
      `INSERT INTO users (id, name, email, phone, password, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, email || null, phone || null, hashedPassword, userRole]
    );

    res.status(201).json({
      id: userId,
      name,
      email,
      phone,
      role: userRole,
      message: 'Cadastro realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Validação
    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Buscar usuário
    let user;
    if (email) {
      user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    } else {
      user = await dbGet('SELECT * FROM users WHERE phone = ?', [phone]);
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'seu_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Obter perfil do usuário autenticado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
});

module.exports = router;
