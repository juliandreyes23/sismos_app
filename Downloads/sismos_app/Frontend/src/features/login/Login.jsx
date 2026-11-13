
import { useState } from "react";
import { login } from "../../services/api";

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function iniciarSesion(e) {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            await login(username, password);
            onLogin(username);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="login-page">
            <section className="login-card">
                <div className="login-logo">
                    <span>⌁</span>
                </div>

                <h2>Bienvenido</h2>

                <p className="login-description">
                    Ingresa a tu cuenta para consultar la actividad sísmica
                    en tiempo real.
                </p>

                <form onSubmit={iniciarSesion}>
                    <div>
                        <label htmlFor="username">Nombre de usuario</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={cargando}>
                        {cargando ? 'Verificando acceso...' : 'Iniciar sesión'}
                    </button>
                </form>

                {error && (
                    <p className="login-error">{error}</p>
                )}
            </section>
        </div>
    );
}

export default Login;
