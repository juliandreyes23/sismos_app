
import { useState } from "react";
import { login } from "../../services/api";

function Login({ onLogin, onVolver }) {
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
        <div className="login-pagina">
            <section className="login-tarjeta">
                <div className="login-logo">
                    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 34h8l4-14 5 28 5-34 5 26 4-12 3 6h14"
                            fill="none" stroke="#38bdf8" strokeWidth="4"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h2>Bienvenido de nuevo</h2>

                <p className="login-descripcion">
                    Ingresa a tu cuenta para consultar la actividad sísmica
                    en tiempo real.
                </p>

                <form onSubmit={iniciarSesion}>
                    <div className="campo">
                        <label htmlFor="username">Nombre de usuario</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primario" disabled={cargando}>
                        {cargando ? 'Verificando acceso...' : 'Iniciar sesión'}
                    </button>
                </form>

                {error && (
                    <p className="login-error">{error}</p>
                )}

                {onVolver && (
                    <a
                        href="#inicio"
                        className="login-volver"
                        onClick={(e) => {
                            e.preventDefault();
                            onVolver();
                        }}
                    >
                        ← Volver al inicio
                    </a>
                )}
            </section>
        </div>
    );
}

export default Login;
