import React, { useState, useEffect } from 'react';
import { Shield, Lock, Gamepad2, MessageSquare, Users, AlertTriangle, ChevronRight, Check, X, Menu, Home, Eye, EyeOff, ThumbsUp, ThumbsDown, Edit3, LogOut, LogIn, ArrowLeft, Send, TrendingUp, Star } from 'lucide-react';

// ============================================
// HOOKS Y UTILIDADES
// ============================================

const useLocalStorage = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }, [key, state]);

  return [state, setState];
};

const useAuth = () => {
  const [user, setUser] = useLocalStorage('auth_user', null);
  
  const login = (email, password) => {
    if (email === 'admin@seguridad.com' && password === 'Admin123!') {
      const userData = { email, id: 'admin_1', isAdmin: true };
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas' };
  };

  const logout = () => setUser(null);

  return { user, login, logout, isAuthenticated: !!user };
};

const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  const strength = score === 0 ? 'empty' : score <= 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'good' : 'strong';
  
  return { checks, score, strength };
};

// ============================================
// COMPONENTES REUTILIZABLES
// ============================================

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-cyan-500/50',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg hover:shadow-red-500/50',
    outline: 'border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-900'
  };

  return (
    <button 
      className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const InfoCard = ({ icon: Icon, title, children, variant = 'default' }) => {
  const variants = {
    default: 'border-cyan-500/30 bg-slate-800/50',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
    success: 'border-green-500/30 bg-green-500/5'
  };

  return (
    <div className={`rounded-xl p-6 border ${variants[variant]} transition-all hover:scale-[1.02]`}>
      {(Icon || title) && (
        <div className="flex items-center gap-3 mb-4">
          {Icon && <Icon className="w-6 h-6 text-cyan-400" />}
          {title && <h3 className="text-xl font-bold text-slate-100">{title}</h3>}
        </div>
      )}
      <div className="text-slate-300 space-y-3">{children}</div>
    </div>
  );
};

const Navigation = ({ currentPage, setCurrentPage, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const pages = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'phishing', label: 'Phishing', icon: Shield },
    { id: 'security', label: 'Ciberseguridad', icon: Lock },
    { id: 'gaming', label: 'Videojuegos', icon: Gamepad2 },
    { id: 'social', label: 'Redes Sociales', icon: MessageSquare },
    { id: 'grooming', label: 'Grooming', icon: AlertTriangle }
  ];

  return (
    <>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-slate-800 p-3 rounded-lg border border-cyan-500/30 shadow-lg"
      >
        <Menu className="w-6 h-6 text-cyan-400" />
      </button>

      <nav className={`fixed md:sticky top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-4">
            {pages.map(page => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => {
                    setCurrentPage(page.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                    ${currentPage === page.id 
                      ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/50' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-400'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{page.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

const Quiz = ({ questions, title, icon: Icon }) => {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  const handleAnswer = (questionId, isCorrect) => {
    if (answers[questionId] !== undefined) return;
    setAnswers(prev => ({ ...prev, [questionId]: isCorrect }));
    if (isCorrect) setScore(prev => prev + 1);
  };

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="sticky top-20 bg-slate-800 rounded-xl p-4 border-2 border-cyan-500 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{score}/{questions.length}</div>
            <div className="text-sm text-slate-400">{percentage}%</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            {q.platform && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                q.platform === 'Android' ? 'bg-green-500 text-slate-900' :
                q.platform === 'iOS' ? 'bg-slate-200 text-slate-900' :
                'bg-blue-500 text-white'
              }`}>
                {q.platform}
              </span>
            )}
            
            <p className="text-lg font-semibold mb-4 text-slate-100">{idx + 1}. {q.question}</p>
            
            <div className="space-y-2">
              {q.options.map((option, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleAnswer(idx, option.correct)}
                  disabled={answers[idx] !== undefined}
                  className={`w-full text-left p-4 rounded-lg border transition-all
                    ${answers[idx] === undefined 
                      ? 'border-slate-600 hover:border-cyan-500 hover:bg-slate-700' 
                      : option.correct 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-slate-600 opacity-50'}`}
                >
                  <div className="flex items-start gap-3">
                    {answers[idx] !== undefined && option.correct && (
                      <Check className="w-5 h-5 text-green-400 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="text-slate-200">{option.text}</div>
                      {answers[idx] !== undefined && option.feedback && (
                        <div className={`mt-2 text-sm ${option.correct ? 'text-green-400' : 'text-red-400'}`}>
                          {option.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// PÁGINA DE ADMINISTRACIÓN
// ============================================

const AdminPage = ({ setCurrentPage }) => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [postForm, setPostForm] = useState({ titulo: '', contenido: '' });
  const [posts, setPosts] = useLocalStorage('grooming_posts', []);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(loginForm.email, loginForm.password);
    if (result.success) {
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (postForm.titulo.trim() && postForm.contenido.trim()) {
      const newPost = {
        id: Date.now(),
        titulo: postForm.titulo,
        contenido: postForm.contenido,
        likes: 0,
        dislikes: 0,
        fecha: new Date().toISOString()
      };
      setPosts([...posts, newPost]);
      setPostForm({ titulo: '', contenido: '' });
      setSuccess('¡Historia publicada con éxito!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <button 
          onClick={() => setCurrentPage('grooming')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Blog
        </button>

        <div className="bg-slate-800/50 rounded-xl p-8 border border-cyan-500/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-cyan-400" />
            Panel de Administrador
          </h2>
          
          <p className="text-slate-400 mb-6 text-sm">
            Ingresa con las credenciales de administrador. Demo: admin@seguridad.com / Admin123!
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Correo de administrador"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none text-slate-100"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none text-slate-100"
              required
            />
            <Button type="submit" className="w-full">
              <LogIn className="w-4 h-4 inline mr-2" />
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setCurrentPage('grooming')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Blog
        </button>
        <Button variant="danger" onClick={logout}>
          <LogOut className="w-4 h-4 inline mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-8 border border-cyan-500/30">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Edit3 className="w-6 h-6 text-cyan-400" />
          Escribir Nueva Historia
        </h2>

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handlePublish} className="space-y-4">
          <input
            type="text"
            placeholder="Título de la historia"
            value={postForm.titulo}
            onChange={(e) => setPostForm({...postForm, titulo: e.target.value})}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none text-slate-100"
            required
          />
          <textarea
            placeholder="Escribe la historia aquí..."
            value={postForm.contenido}
            onChange={(e) => setPostForm({...postForm, contenido: e.target.value})}
            rows="10"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none text-slate-100"
            required
          />
          <Button type="submit">
            <Send className="w-4 h-4 inline mr-2" />
            Publicar Historia
          </Button>
        </form>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Historias Publicadas ({posts.length})</h3>
        <div className="space-y-4">
          {posts.slice().reverse().map(post => (
            <div key={post.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="font-semibold text-cyan-400">{post.titulo}</div>
              <div className="text-sm text-slate-400 mt-1">
                {new Date(post.fecha).toLocaleDateString('es-ES')}
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-400">👍 {post.likes}</span>
                <span className="text-red-400">👎 {post.dislikes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// PÁGINAS PRINCIPALES
// ============================================

const HomePage = () => {
  const [report, setReport] = useState({ title: '', description: '' });
  const [reports, setReports] = useLocalStorage('community_reports', []);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (report.title.trim() && report.description.trim()) {
      setReports([...reports, { 
        ...report, 
        date: new Date().toISOString(), 
        id: Date.now() 
      }]);
      setReport({ title: '', description: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/20 via-slate-800 to-purple-500/20 p-8 md:p-12 border border-cyan-500/30">
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Unidos por un Internet Seguro
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Plataforma educativa para la prevención de ciberamenazas
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <InfoCard icon={Shield} title="📚 Educación">
          <p>Guías sobre Phishing, Grooming y más técnicas de ciberdelincuencia.</p>
        </InfoCard>
        <InfoCard icon={Lock} title="🛡️ Prevención">
          <p>Simuladores interactivos con situaciones reales de riesgo.</p>
        </InfoCard>
        <InfoCard icon={AlertTriangle} title="📣 Denuncia">
          <p>Sistema de reportes comunitarios para alertar sobre amenazas.</p>
        </InfoCard>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-8 border border-cyan-500/30">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Send className="w-6 h-6 text-yellow-400" />
          Centro de Reportes Ciudadanos
        </h2>
        
        {submitted && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
            ✅ Reporte enviado. Gracias por contribuir.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Título del reporte"
            value={report.title}
            onChange={(e) => setReport({...report, title: e.target.value})}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none text-slate-100"
            required
          />
          <textarea
            placeholder="Describe lo sucedido..."
            value={report.description}
            onChange={(e) => setReport({...report, description: e.target.value})}
            rows="5"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none text-slate-100"
            required
          />
          <Button type="submit">Enviar Reporte</Button>
        </form>
      </div>

      {reports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Reportes Recientes</h3>
          {reports.slice(-5).reverse().map(r => (
            <div key={r.id} className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <div className="font-semibold text-cyan-400">{r.title}</div>
              <div className="text-sm text-slate-400">{new Date(r.date).toLocaleDateString()}</div>
              <div className="text-slate-300 mt-2">{r.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PhishingPage = () => {
  const questions = [
    {
      platform: "Android",
      question: "WhatsApp: Alguien te pide el código de 6 dígitos que te llegó por SMS.",
      options: [
        { text: "Dárselo, parece urgente.", correct: false, feedback: "❌ ERROR: Ese código es para robar tu cuenta." },
        { text: "Bloquear inmediatamente.", correct: true, feedback: "✅ ¡CORRECTO! Nunca compartas códigos." }
      ]
    },
    {
      platform: "iOS",
      question: "iCloud: Un correo dice que tu espacio está lleno.",
      options: [
        { text: "Dar clic para pagar.", correct: false, feedback: "❌ ERROR: Es phishing para robar tu Apple ID." },
        { text: "Ir a Ajustes manualmente.", correct: true, feedback: "✅ ¡CORRECTO! Verifica desde configuración oficial." }
      ]
    },
    {
      platform: "Windows",
      question: "Recibes 'Cobro.zip' de desconocido.",
      options: [
        { text: "No abrirlo y borrar.", correct: true, feedback: "✅ ¡CORRECTO! Los .zip suelen traer virus." },
        { text: "Abrirlo para ver.", correct: false, feedback: "❌ ERROR: Puede contener malware." }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
        Protección contra Phishing
      </h1>

      <InfoCard icon={Shield} title="¿Qué es el Phishing?">
        <p>El phishing es cuando un atacante se hace pasar por una entidad confiable (banco, red social) para robarte información personal.</p>
      </InfoCard>

      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard title="🎣 Señales de Alerta">
          <ul className="space-y-2">
            <li>• Urgencia excesiva ("actúa ahora")</li>
            <li>• Errores ortográficos</li>
            <li>• Enlaces sospechosos</li>
            <li>• Solicitudes de datos personales</li>
          </ul>
        </InfoCard>

        <InfoCard title="🛡️ Cómo Protegerte">
          <ul className="space-y-2">
            <li>✓ Verifica el remitente</li>
            <li>✓ No hagas clic en links sospechosos</li>
            <li>✓ Usa autenticación 2FA</li>
            <li>✓ Contacta directamente a la empresa</li>
          </ul>
        </InfoCard>
      </div>

      <Quiz questions={questions} title="Test de Phishing" icon={Shield} />
    </div>
  );
};

const SecurityPage = () => {
  const [password, setPassword] = useState('');
  const validation = validatePassword(password);

  const strengthColors = {
    empty: 'bg-slate-700',
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-green-500',
    strong: 'bg-cyan-500'
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Ciberseguridad Total
      </h1>

      <div className="bg-slate-800/50 rounded-xl p-8 border border-cyan-500/30">
        <h3 className="text-2xl font-bold mb-4">🔒 Probador de Contraseñas</h3>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Escribe una contraseña..."
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none text-slate-100 mb-4"
        />

        <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full transition-all ${strengthColors[validation.strength]}`}
            style={{ width: `${(validation.score / 4) * 100}%` }}
          />
        </div>

        <ul className="space-y-2">
          <li className={validation.checks.length ? 'text-green-400' : 'text-red-400'}>
            {validation.checks.length ? '✓' : '✗'} Mínimo 8 caracteres
          </li>
          <li className={validation.checks.uppercase ? 'text-green-400' : 'text-red-400'}>
            {validation.checks.uppercase ? '✓' : '✗'} Una MAYÚSCULA
          </li>
          <li className={validation.checks.number ? 'text-green-400' : 'text-red-400'}>
            {validation.checks.number ? '✓' : '✗'} Un número
          </li>
          <li className={validation.checks.special ? 'text-green-400' : 'text-red-400'}>
            {validation.checks.special ? '✓' : '✗'} Un símbolo (!@#$)
          </li>
        </ul>
      </div>
    </div>
  );
};

const GamingPage = () => (
  <div className="space-y-8">
    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
      Seguridad en Videojuegos
    </h1>
    <InfoCard icon={Gamepad2} title="Protege tu Identidad Gamer">
      <p>Los videojuegos son increíbles, pero también tienen riesgos. Aprende a protegerte del doxing, estafas de trading y malware disfrazado.</p>
    </InfoCard>
  </div>
);

const SocialMediaPage = () => (
  <div className="space-y-8">
    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      Redes Sociales Seguras
    </h1>
    <InfoCard icon={MessageSquare} title="Gestiona tu Privacidad">
      <p>Configura correctamente tus redes sociales para proteger tu información personal y reputación digital.</p>
    </InfoCard>
  </div>
);

const GroomingPage = ({ setCurrentPage }) => {
  const [posts, setPosts] = useLocalStorage('grooming_posts', []);
  const [selectedPost, setSelectedPost] = useState(null);
  const [votes, setVotes] = useLocalStorage('post_votes', {});

  const handleVote = (postId, voteType) => {
    if (votes[postId]) return;
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, [voteType]: (post[voteType] || 0) + 1 } : post
    ));
    setVotes({ ...votes, [postId]: voteType });
  };

  if (selectedPost) {
    const post = posts.find(p => p.id === selectedPost);
    const userVote = votes[selectedPost];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Historias
        </button>

        <div className="bg-slate-800/50 rounded-xl p-8 border border-red-500/30">
          <div className="text-sm text-red-400 mb-2">
            {new Date(post.fecha).toLocaleDateString('es-ES', { 
              day: '2-digit', month: 'long', year: 'numeric' 
            })}
          </div>
          <h1 className="text-3xl font-bold mb-6">{post.titulo}</h1>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-8">
            {post.contenido}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleVote(selectedPost, 'likes')}
              disabled={userVote}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all
                ${userVote === 'likes' ? 'bg-green-500 text-white border-green-500' : 'border-green-500/50 hover:bg-green-500/10'}`}
            >
              <ThumbsUp className="w-5 h-5" />
              {post.likes || 0}
            </button>
            <button
              onClick={() => handleVote(selectedPost, 'dislikes')}
              disabled={userVote}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all
                ${userVote === 'dislikes' ? 'bg-red-500 text-white border-red-500' : 'border-red-500/50 hover:bg-red-500/10'}`}
            >
              <ThumbsDown className="w-5 h-5" />
              {post.dislikes || 0}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
        Prevención de Grooming
      </h1>

      <div className="flex justify-between items-center">
        <p className="text-xl text-slate-300">Casos reales y alertas de la comunidad</p>
        <Button onClick={() => setCurrentPage('admin')}>
          <Edit3 className="w-4 h-4 inline mr-2" />
          Publicar Historia
        </Button>
      </div>

      <InfoCard icon={AlertTriangle} title="¿Qué es el Grooming?" variant="danger">
        <p>El grooming es cuando un adulto construye confianza con un menor para obtener beneficios ilegales. Es un proceso de "preparación" gradual.</p>
      </InfoCard>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400">
            No hay historias publicadas aún. Sé el primero en compartir.
          </div>
        ) : (
          posts.slice().reverse().map(post => (
            <div 
              key={post.id}
              onClick={() => setSelectedPost(post.id)}
              className="bg-slate-800/50 rounded-xl p-6 border border-red-500/30 cursor-pointer hover:border-red-500 hover:scale-105 transition-all"
            >
              <h3 className="text-xl font-bold text-red-400 mb-3">{post.titulo}</h3>
              <p className="text-slate-300 line-clamp-3 mb-4">
                {post.contenido.substring(0, 100)}...
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">👍 {post.likes || 0}</span>
                <span className="text-red-400">👎 {post.dislikes || 0}</span>
              </div>
              <div className="mt-4 text-cyan-400 text-sm font-semibold">
                Ver detalles →
              </div>
            </div>
          ))
        )}
      </div>

      <InfoCard title="📞 Ayuda Inmediata" variant="warning">
        <div className="grid md:grid-cols-2 gap-4">
          <div><strong className="text-yellow-400">Emergencias:</strong> 911</div>
          <div><strong className="text-yellow-400">Policía Cibernética:</strong> policia.cibernetica@gob.mx</div>
          <div><strong className="text-yellow-400">Denuncia Online:</strong> iwf.org.uk</div>
          <div><strong className="text-yellow-400">Línea de Ayuda:</strong> 800-123-4567</div>
        </div>
      </InfoCard>
    </div>
  );
};

// ============================================
// APLICACIÓN PRINCIPAL
// ============================================

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'phishing': return <PhishingPage />;
      case 'security': return <SecurityPage />;
      case 'gaming': return <GamingPage />;
      case 'social': return <SocialMediaPage />;
      case 'grooming': return <GroomingPage setCurrentPage={setCurrentPage} />;
      case 'admin': return <AdminPage setCurrentPage={setCurrentPage} />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <header className="bg-slate-900/50 border-b border-cyan-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Seguridad Digital Comunitaria
          </h1>
          <p className="text-slate-400">Plataforma educativa para ciberseguridad</p>
        </div>
      </header>

      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {renderPage()}
      </main>

      <footer className="bg-slate-900 border-t border-cyan-500/20 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2025 Seguridad Digital Comunitaria</p>
          <p className="text-sm mt-2">Plataforma educativa para la prevención de ciberamenazas</p>
        </div>
      </footer>
    </div>
  );
};

export default App;