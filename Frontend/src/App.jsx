
import { useState } from 'react';
import Listado from './features/listado/Listado';
import Stats from './features/stats/Stats';
import MapaSismos from './features/mapa/MapaSismos';
import Login from './features/login/Login';
import { sincronizar } from './services/api';
import './App.css';

function App() {
    const [seccion, setSeccion] = useState('listado');

    const [usuario, setUsuario] = useState(() =>
        localStorage.getItem('token')
            ? localStorage.getItem('username')
            : null
    );

    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const [actualizarListado, setActualizarListado] = useState(0);

    const filtros = {
        anio: '',
        red: '',
        magnitud__gte: ''
    };

    async function ejecutarSincronizacion() {
        setCargando(true);
        setMensaje('');

        try {
            const resultado = await sincronizar();

            setActualizarListado(prev => prev + 1);

            setMensaje(
                `Sincronización completada. Nuevos sismos: ${resultado.sincronizados}`
            );
        } catch (error) {
            setMensaje(error.message);
        } finally {
            setCargando(false);
        }
    }

    function cerrarSesion() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        setUsuario(null);
        setSeccion('listado');
        setMensaje('');
    }

    return (
        <div>
            <header>
                <h1>Sistema de Monitoreo Sísmico</h1>

                {usuario && (
                    <nav>
                        <button onClick={() => setSeccion('listado')}>
                            Listado de sismos
                        </button>

                        <button onClick={() => setSeccion('stats')}>
                            Estadísticas
                        </button>

                        <button onClick={() => setSeccion('mapa')}>
                            Mapa de sismos
                        </button>
                    </nav>
                )}

                {usuario && (
                    <div>
                        <p>Sesión iniciada: {usuario}</p>

                        <button
                            onClick={ejecutarSincronizacion}
                            disabled={cargando}
                        >
                            {cargando ? 'Sincronizando...' : 'Sincronizar USGS'}
                        </button>

                        <button onClick={cerrarSesion}>
                            Cerrar sesión
                        </button>
                    </div>
                )}

                {mensaje && <p>{mensaje}</p>}
            </header>

            <main>
                {!usuario ? (
                    <Login
                        onLogin={(nombre) => {
                            setUsuario(nombre);
                            setSeccion('listado');
                        }}
                    />
                ) : (
                    <>
                        {seccion === 'listado' && (
                            <Listado actualizar={actualizarListado} />
                        )}
                        {seccion === 'stats' && <Stats />}
                        {seccion === 'mapa' && (
                            <MapaSismos filtros={filtros} />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
