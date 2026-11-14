
function Inicio({ onIrALogin, haySesion }) {
    return (
        <div className="inicio">
            {/* Sección principal */}
            <section className="inicio-hero">
                <div className="texto">
                    <span className="etiqueta-hero">
                        <span className="punto" />
                        Datos en tiempo real · Fuente USGS
                    </span>

                    <h1>
                        Monitorea la actividad sísmica del{' '}
                        <span className="acento">mundo entero</span>
                    </h1>

                    <p>
                        Plataforma web que centraliza, sincroniza y analiza los
                        eventos sísmicos reportados por el Servicio Geológico
                        de los Estados Unidos (USGS). Consulta el listado
                        completo, explora el mapa interactivo y descubre
                        patrones con estadísticas filtrables.
                    </p>

                    <div className="acciones-hero">
                        <button
                            className="btn btn-primario btn-grande"
                            onClick={onIrALogin}
                        >
                            {haySesion ? 'Continuar al sistema →' : 'Ingresar al sistema →'}
                        </button>

                        <span className="inicio-legal">
                            Requiere iniciar sesión
                        </span>
                    </div>
                </div>

                <div className="visual" aria-hidden="true">
                    <svg viewBox="0 0 520 400" xmlns="http://www.w3.org/2000/svg">
                        {/* rejilla de fondo */}
                        <g stroke="#1c2c44" strokeWidth="1">
                            <line x1="40" y1="60" x2="480" y2="60" />
                            <line x1="40" y1="120" x2="480" y2="120" />
                            <line x1="40" y1="180" x2="480" y2="180" />
                            <line x1="40" y1="240" x2="480" y2="240" />
                            <line x1="40" y1="300" x2="480" y2="300" />
                        </g>

                        {/* onda sísmica */}
                        <path
                            d="M40 200 L120 200 L140 130 L160 265 L185 95 L210 295 L235 150 L255 240 L275 190 L310 190 L330 120 L350 255 L375 105 L400 285 L425 160 L445 235 L480 200"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* línea base */}
                        <line
                            x1="40" y1="200" x2="480" y2="200"
                            stroke="#24354f" strokeWidth="1.5"
                            strokeDasharray="6 6"
                        />

                        {/* puntos de datos */}
                        <g fill="#60a5fa">
                            <circle cx="185" cy="95" r="5" />
                            <circle cx="375" cy="105" r="5" />
                            <circle cx="210" cy="295" r="5" />
                        </g>
                        <circle cx="185" cy="95" r="10" fill="none" stroke="#60a5fa" strokeOpacity="0.4" />
                        <circle cx="375" cy="105" r="10" fill="none" stroke="#60a5fa" strokeOpacity="0.4" />

                        {/* etiquetas */}
                        <g fontFamily="Segoe UI, Arial, sans-serif" fontSize="12" fill="#6b7d99">
                            <text x="40" y="46">Actividad sísmica global</text>
                            <text x="40" y="345">Los eventos de mayor magnitud se resaltan automáticamente</text>
                        </g>
                    </svg>
                </div>
            </section>

            {/* Funcionalidades */}
            <section className="inicio-funciones">
                <h2>¿Qué encontrarás dentro?</h2>
                <p>
                    Tres módulos conectados a la misma base de datos para
                    consultar, visualizar y analizar los sismos registrados.
                </p>

                <div className="funciones-grid">
                    <article className="funcion">
                        <div className="icono">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                        </div>
                        <h3>Listado de sismos</h3>
                        <p>
                            Explora todos los eventos registrados con búsqueda
                            por lugar, ordenamiento por fecha o magnitud y
                            filtros por red sísmica.
                        </p>
                    </article>

                    <article className="funcion">
                        <div className="icono">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <h3>Mapa interactivo</h3>
                        <p>
                            Visualiza los eventos sobre el mapa mundial, con
                            círculos proporcionales a la magnitud y filtros por
                            lugar, año, red y magnitud.
                        </p>
                    </article>

                    <article className="funcion">
                        <div className="icono">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                        </div>
                        <h3>Estadísticas</h3>
                        <p>
                            Resumen general, zonas más activas y distribución
                            por tipo de magnitud y año, con filtros de análisis.
                        </p>
                    </article>
                </div>
            </section>

            {/* Tarjeta de créditos */}
            <section className="seccion-creditos">
                <div className="tarjeta-creditos">
                    <div className="creditos-avatar" aria-hidden="true">JR</div>

                    <div className="creditos-info">
                        <p className="rol">Desarrollado por</p>
                        <h2>Julián David Reyes Villate</h2>

                        <div className="creditos-detalles">
                            <p>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10 12 5 2 10l10 5 10-5z" />
                                    <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
                                </svg>
                                Formación: Análisis y Desarrollo de Software (ADSO)
                            </p>

                            <p>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21h18" />
                                    <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" />
                                    <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
                                </svg>
                                Institución: Servicio Nacional de Aprendizaje (SENA)
                            </p>
                        </div>
                    </div>
                </div>

                <p className="creditos-sello">
                    Sistema de Monitoreo Sísmico · <strong>GeoSismos</strong> · Proyecto formativo
                </p>
            </section>
        </div>
    );
}

export default Inicio;
