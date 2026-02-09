import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, setAuthToken } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/AuthPage.css';

function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        // Login
        const response = await loginUser({
          email: formData.email || null,
          phone: formData.phone || null,
          password: formData.password
        });

        setAuthToken(response.data.token);
        login(response.data.user, response.data.token);
        navigate(response.data.user.role === 'admin' ? '/admin' : '/user');
      } else {
        // Registro
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não correspondem');
          setLoading(false);
          return;
        }

        await registerUser({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          password: formData.password,
          role: formData.role
        });

        setError('');
        setIsLoginMode(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'user'
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>📋 Fila Virtual</h1>
          <p>Sistema de Gerenciamento de Senhas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isLoginMode ? 'Entrar' : 'Cadastrar'}</h2>

          {error && <div className="error-message">{error}</div>}

          {!isLoginMode && (
            <>
              <div className="form-group">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Tipo de Cadastro</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">Usuário Comum</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email ou Telefone</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email || formData.phone}
              placeholder={isLoginMode ? 'Email ou telefone' : 'seu@email.com ou (11) 99999-9999'}
              onChange={(e) => {
                if (isLoginMode) {
                  setFormData(prev => ({
                    ...prev,
                    email: e.target.value.includes('@') ? e.target.value : '',
                    phone: !e.target.value.includes('@') ? e.target.value : ''
                  }));
                } else {
                  handleChange(e);
                }
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Sua senha segura"
            />
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirme sua senha"
              />
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processando...' : (isLoginMode ? 'Entrar' : 'Cadastrar')}
          </button>

          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                role: 'user'
              });
            }}
          >
            {isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </form>

        <div className="auth-footer">
          <a href="/public" className="public-link">Ver Tela Pública</a>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
