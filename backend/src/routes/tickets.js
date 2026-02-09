const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll, getNextTicketNumber } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Criar novo ticket (gerar senha)
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const ticketId = uuidv4();
    
    // Obter próximo número
    const ticketNumber = await getNextTicketNumber();

    await dbRun(
      `INSERT INTO tickets (id, user_id, ticket_number, status) 
       VALUES (?, ?, ?, ?)`,
      [ticketId, userId, ticketNumber, 'aberto']
    );

    // Emitir evento de novo ticket
    const app = require('../index');
    app.io.to('admin').emit('new_ticket', {
      id: ticketId,
      ticket_number: ticketNumber,
      status: 'aberto',
      created_at: new Date()
    });

    app.io.to('public_display').emit('ticket_update', {
      type: 'new_ticket',
      ticket_number: ticketNumber
    });

    res.status(201).json({
      id: ticketId,
      ticket_number: ticketNumber,
      status: 'aberto',
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao gerar ticket:', error);
    res.status(500).json({ error: 'Erro ao gerar ticket' });
  }
});

// Obter ticket atual do usuário
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const ticket = await dbGet(
      `SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Nenhum ticket encontrado' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Erro ao obter ticket:', error);
    res.status(500).json({ error: 'Erro ao obter ticket' });
  }
});

// Obter histórico de tickets do usuário
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const tickets = await dbAll(
      `SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    res.json(tickets);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ error: 'Erro ao obter histórico' });
  }
});

// Obter todos os tickets (para tela pública)
router.get('/public', async (req, res) => {
  try {
    const tickets = await dbAll(
      `SELECT ticket_number, status, created_at, called_at FROM tickets ORDER BY created_at DESC LIMIT 100`
    );

    const summary = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'aberto').length,
      called: tickets.filter(t => t.status === 'chamada').length,
      completed: tickets.filter(t => t.status === 'atendida').length,
      notShowed: tickets.filter(t => t.status === 'não compareceu').length,
      tickets
    };

    res.json(summary);
  } catch (error) {
    console.error('Erro ao obter tickets públicos:', error);
    res.status(500).json({ error: 'Erro ao obter tickets' });
  }
});

module.exports = router;
