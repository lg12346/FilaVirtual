const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obter todos os tickets em aberto
router.get('/tickets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tickets = await dbAll(
      `SELECT t.*, u.name as user_name, u.phone as user_phone 
       FROM tickets t 
       LEFT JOIN users u ON t.user_id = u.id 
       ORDER BY 
         CASE 
           WHEN t.status = 'chamada' THEN 1
           WHEN t.status = 'aberto' THEN 2
           WHEN t.status = 'atendida' THEN 3
           WHEN t.status = 'não compareceu' THEN 4
         END,
         t.created_at ASC`
    );

    res.json(tickets);
  } catch (error) {
    console.error('Erro ao obter tickets:', error);
    res.status(500).json({ error: 'Erro ao obter tickets' });
  }
});

// Chamar próximo ticket
router.post('/call-next', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { counterNumber } = req.body;

    // Buscar próximo ticket em aberto
    const nextTicket = await dbGet(
      `SELECT * FROM tickets WHERE status = 'aberto' ORDER BY created_at ASC LIMIT 1`
    );

    if (!nextTicket) {
      return res.status(404).json({ error: 'Nenhum ticket em aberto' });
    }

    // Atualizar status
    await dbRun(
      `UPDATE tickets SET status = ?, called_at = ?, admin_id = ? WHERE id = ?`,
      ['chamada', new Date().toISOString(), adminId, nextTicket.id]
    );

    // Log de auditoria
    await dbRun(
      `INSERT INTO audit_logs (id, admin_id, action, ticket_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), adminId, 'call_ticket', nextTicket.id, `Balcão ${counterNumber || 'N/A'}`]
    );

    const app = require('../index');

    // Emitir evento
    app.io.to(`user_${nextTicket.user_id}`).emit('ticket_called', {
      ticket_number: nextTicket.ticket_number,
      counter: counterNumber || 'Atendimento'
    });

    app.io.to('public_display').emit('ticket_called', {
      ticket_number: nextTicket.ticket_number,
      counter: counterNumber || 'Atendimento'
    });

    res.json({
      id: nextTicket.id,
      ticket_number: nextTicket.ticket_number,
      status: 'chamada',
      counter: counterNumber || 'Atendimento'
    });
  } catch (error) {
    console.error('Erro ao chamar ticket:', error);
    res.status(500).json({ error: 'Erro ao chamar ticket' });
  }
});

// Chamar ticket específico
router.post('/call-specific', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { ticketId, counterNumber } = req.body;

    const ticket = await dbGet(`SELECT * FROM tickets WHERE id = ?`, [ticketId]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Atualizar status
    await dbRun(
      `UPDATE tickets SET status = ?, called_at = ?, admin_id = ? WHERE id = ?`,
      ['chamada', new Date().toISOString(), adminId, ticketId]
    );

    // Log de auditoria
    await dbRun(
      `INSERT INTO audit_logs (id, admin_id, action, ticket_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), adminId, 'call_specific_ticket', ticketId, `Balcão ${counterNumber || 'N/A'}`]
    );

    const app = require('../index');

    // Emitir evento
    app.io.to(`user_${ticket.user_id}`).emit('ticket_called', {
      ticket_number: ticket.ticket_number,
      counter: counterNumber || 'Atendimento'
    });

    app.io.to('public_display').emit('ticket_called', {
      ticket_number: ticket.ticket_number,
      counter: counterNumber || 'Atendimento'
    });

    res.json({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      status: 'chamada',
      counter: counterNumber || 'Atendimento'
    });
  } catch (error) {
    console.error('Erro ao chamar ticket específico:', error);
    res.status(500).json({ error: 'Erro ao chamar ticket' });
  }
});

// Completar atendimento
router.post('/complete-ticket', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { ticketId } = req.body;

    const ticket = await dbGet(`SELECT * FROM tickets WHERE id = ?`, [ticketId]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Atualizar status
    await dbRun(
      `UPDATE tickets SET status = ?, completed_at = ? WHERE id = ?`,
      ['atendida', new Date().toISOString(), ticketId]
    );

    // Log de auditoria
    await dbRun(
      `INSERT INTO audit_logs (id, admin_id, action, ticket_id) 
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), adminId, 'complete_ticket', ticketId]
    );

    const app = require('../index');

    app.io.to(`user_${ticket.user_id}`).emit('ticket_completed', {
      ticket_number: ticket.ticket_number
    });

    app.io.to('public_display').emit('ticket_update', {
      type: 'completed',
      ticket_number: ticket.ticket_number
    });

    res.json({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      status: 'atendida'
    });
  } catch (error) {
    console.error('Erro ao completar ticket:', error);
    res.status(500).json({ error: 'Erro ao completar ticket' });
  }
});

// Marcar como não compareceu
router.post('/no-show', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { ticketId } = req.body;

    const ticket = await dbGet(`SELECT * FROM tickets WHERE id = ?`, [ticketId]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Atualizar status
    await dbRun(
      `UPDATE tickets SET status = ?, completed_at = ? WHERE id = ?`,
      ['não compareceu', new Date().toISOString(), ticketId]
    );

    // Log de auditoria
    await dbRun(
      `INSERT INTO audit_logs (id, admin_id, action, ticket_id) 
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), adminId, 'no_show', ticketId]
    );

    const app = require('../index');

    app.io.to('public_display').emit('ticket_update', {
      type: 'no_show',
      ticket_number: ticket.ticket_number
    });

    res.json({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      status: 'não compareceu'
    });
  } catch (error) {
    console.error('Erro ao marcar como não compareceu:', error);
    res.status(500).json({ error: 'Erro ao marcar como não compareceu' });
  }
});

// Obter estatísticas
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const stats = await dbAll(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tickets
      WHERE DATE(created_at) = ?
      GROUP BY status
    `, [today]);

    const summary = {
      open: 0,
      called: 0,
      completed: 0,
      notShowed: 0
    };

    stats.forEach(stat => {
      if (stat.status === 'aberto') summary.open = stat.count;
      if (stat.status === 'chamada') summary.called = stat.count;
      if (stat.status === 'atendida') summary.completed = stat.count;
      if (stat.status === 'não compareceu') summary.notShowed = stat.count;
    });

    summary.total = summary.open + summary.called + summary.completed + summary.notShowed;

    res.json(summary);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

module.exports = router;
