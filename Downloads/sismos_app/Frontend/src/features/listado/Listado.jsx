
import { useEffect, useState } from 'react';
import { getSismos } from '../../services/api';

function Listado() {
    const [filtros, setFiltros] = useState({
        page: 1,
        search: '',
        ordering: '-fecha_hora',
        tipo_magnitud: '',
        red: '',
        magnitud__gte: ''
    });

    const [datos, setDatos] = useState({
        count: 0,
        next: null,
        previous: null,
        results: []
    });

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getSismos(filtros)
            .then((respuesta) => setDatos(respuesta))
            .catch((error) => setError(error.message))
            .finally(() => setCargando(false));

    }, [filtros]);

    function cambiarFiltro(campo, valor) {
        setCargando(true);
        setError('');

        setFiltros({
            ...filtros,
            [campo]: valor,
            page: 1
        });
    }

    function cambiarPagina(numero) {
        setCargando(true);
        setError('');

        setFiltros({
            ...filtros,
            page: numero
        });
    }

    return (
        <div>
            <h1>Listado de sismos</h1>

            <h3>{datos.count.toLocaleString('es-CO')} sismos encontrados</h3>

            <div>
                <input
                    type="text"
                    placeholder="Buscar sismos..."
                    value={filtros.search}
                    onChange={(e) => cambiarFiltro('search', e.target.value)}
                />

                <select
                    value={filtros.ordering}
                    onChange={(e) => cambiarFiltro('ordering', e.target.value)}
                >
                    <option value="-fecha_hora">Más recientes</option>
                    <option value="fecha_hora">Más antiguos</option>
                    <option value="-magnitud">Mayor magnitud</option>
                    <option value="magnitud">Menor magnitud</option>
                </select>

                <select
                    value={filtros.tipo_magnitud}
                    onChange={(e) => cambiarFiltro('tipo_magnitud', e.target.value)}
                >
                    <option value="">Todos los tipos</option>
                    <option value="mw">MW</option>
                    <option value="mb">MB</option>
                    <option value="ml">ML</option>
                    <option value="md">MD</option>
                </select>

                <select
                    value={filtros.red}
                    onChange={(e) => cambiarFiltro('red', e.target.value)}
                >
                    <option value="">Todas las redes</option>
                    <option value="us">US</option>
                    <option value="ak">AK</option>
                    <option value="ci">CI</option>
                    <option value="nc">NC</option>
                </select>

                <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Magnitud mínima"
                    value={filtros.magnitud__gte}
                    onChange={(e) => cambiarFiltro('magnitud__gte', e.target.value)}
                />
            </div>

            {cargando && <p>Cargando sismos...</p>}

            {error && <p>Error: {error}</p>}

            {!cargando && !error && (
                <table border="1" cellPadding="8">
                    <thead>
                        <tr>
                            <th>ID USGS</th>
                            <th>Magnitud</th>
                            <th>Lugar</th>
                            <th>Profundidad</th>
                            <th>Fecha</th>
                            <th>Red</th>
                        </tr>
                    </thead>

                    <tbody>
                        {datos.results.map((sismo) => (
                            <tr key={sismo.id}>
                                <td>{sismo.id_usgs}</td>
                                <td>{sismo.magnitud}</td>
                                <td>{sismo.lugar}</td>
                                <td>{sismo.profundidad_km} km</td>
                                <td>{sismo.fecha_hora}</td>
                                <td>{sismo.red}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div>
                <button
                    disabled={!datos.previous || cargando}
                    onClick={() => cambiarPagina(filtros.page - 1)}
                >
                    Anterior
                </button>

                <span> Página {filtros.page} </span>

                <button
                    disabled={!datos.next || cargando}
                    onClick={() => cambiarPagina(filtros.page + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}

export default Listado;
