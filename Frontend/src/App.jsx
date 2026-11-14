
import { useState } from 'react';
import Inicio from './features/inicio/Inicio';
import Listado from './features/listado/Listado';
import Stats from './features/stats/Stats';
import MapaSismos from './features/mapa/MapaSismos';
import Login from './features/login/Login';
import { sincronizar } from './services/api';
import './App.css';

function App() {
    const [usuario, setUsuario] = useState(() =>
        localStorage.getItem('token')
            ? localStorage.getItem('username')
            : null
    );

    const [vista, setVista] = useState(usuario ? 'listado' : 'inicio');

    const [mensaje, setMensaje] = useState('');
    const [esError, setEsError] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [actualizarListado, setActualizarListado] = useState(0);

    async function ejecutarSincronizacion() {
        setCargando(true);
        setMensaje('');

        try {
            const resultado = await sincronizar();

            setActualizarListado(prev => prev + 1);

            setEsError(false);
            setMensaje(
                `Sincronización completada. Nuevos sismos: ${resultado.sincronizados}`
            );
        } catch (error) {
            setEsError(true);
            setMensaje(error.message);
        } finally {
            setCargando(false);
        }
    }

    function cerrarSesion() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        setUsuario(null);
        setVista('inicio');
        setMensaje('');
    }

    const secciones = [
        { id: 'listado', etiqueta: 'Listado' },
        { id: 'stats', etiqueta: 'Estadísticas' },
        { id: 'mapa', etiqueta: 'Mapa' }
    ];

    return (
        <div>
            <header className="app-bar">
                <div
                    className="marca"
                    onClick={() => setVista(usuario ? 'listado' : 'inicio')}
                    style={{ cursor: 'pointer' }}
                >
                    <svg className="marca-icono" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="logo-fondo" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#0f1d33" />
                                <stop offset="1" stopColor="#0a1526" />
                            </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logo-fondo)" stroke="#1e3a5f" strokeWidth="2" />
                        <path d="M8 34h8l4-14 5 28 5-34 5 26 4-12 3 6h14"
                            fill="none" stroke="#38bdf8" strokeWidth="3.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <div className="marca-texto">
                        <h1>GeoSismos</h1>
                        <span>Monitoreo sísmico</span>
                    </div>
                </div>

                {usuario && (
                    <nav>
                        {secciones.map((seccion) => (
                            <button
                                key={seccion.id}
                                className={vista === seccion.id ? 'activo' : ''}
                                onClick={() => setVista(seccion.id)}
                            >
                                {seccion.etiqueta}
                            </button>
                        ))}
                    </nav>
                )}

                {usuario ? (
                    <div className="sesion">
                        <span className="sesion-usuario">
                            <span className="punto" />
                            {usuario}
                        </span>

                        <button
                            className="btn btn-primario"
                            onClick={ejecutarSincronizacion}
                            disabled={cargando}
                        >
                            {cargando ? 'Sincronizando...' : 'Sincronizar USGS'}
                        </button>

                        <button className="btn btn-peligro" onClick={cerrarSesion}>
                            Cerrar sesión
                        </button>
                    </div>
                ) : (
                    vista !== 'login' && (
                        <button
                            className="btn btn-primario"
                            onClick={() => setVista('login')}
                        >
                            Iniciar sesión
                        </button>
                    )
                )}

                {mensaje && (
                    <p className={esError ? 'aviso aviso-error' : 'aviso aviso-exito'}>
                        {mensaje}
                    </p>
                )}
            </header>

            <main>
                {vista === 'inicio' && !usuario && (
                    <Inicio
                        onIrALogin={() => setVista('login')}
                        haySesion={Boolean(localStorage.getItem('token'))}
                    />
                )}

                {vista === 'login' && !usuario && (
                    <Login
                        onLogin={(nombre) => {
                            setUsuario(nombre);
                            setVista('listado');
                        }}
                        onVolver={() => setVista('inicio')}
                    />
                )}

                {usuario && (
                    <>
                        {vista === 'listado' && (
                            <Listado actualizar={actualizarListado} />
                        )}
                        {vista === 'stats' && <Stats />}
                        {vista === 'mapa' && <MapaSismos />}
                    </>
                )}
            </main>

            <footer className="pie">
                <span>
                    GeoSismos · Sistema de Monitoreo Sísmico · Datos de USGS
                </span>

                <span className="fuente-datos">
                    <span className="punto" />
                    Desarrollado por Julián David Reyes Villate · SENA
                </span>
            </footer>
        </div>
    );
}

export default App;
