const BASE = import.meta.env.VITE_API_URL || '';


export async function getSismos(params) {
    const filtros = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '')
    );

    const query = new URLSearchParams(filtros).toString();

    const res = await fetch(`${BASE}/api/sismos/?${query}`);

    if(!res.ok) {
        throw new Error('Error cargando sismos');
    }

    return res.json();
}


export async function getStats(params) {
    const filtros = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '')
    );

    const query = new URLSearchParams(filtros).toString();

    const res = await fetch(`${BASE}/api/sismos/stats/?${query}`);

    if (!res.ok) {
        throw new Error('Error cargando estadísticas');
    }

    return res.json();
}

export async function login (username, password) {
    const res = await fetch(`${BASE}/api/login/`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
        throw new Error('Credenciales inválidas');
    }

    const data = await res.json();

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', username);

    return data.token;
}

export async function sincronizar(token = localStorage.getItem('token')) {
    const res = await fetch(`${BASE}/api/sismos/sincronizar/`, {
        method: 'POST',
        headers: token
            ? { 'Authorization': `Token ${token}` }
            : {}
    });

    if (res.status === 401) {
        throw new Error('401: sin credencial válida');
    }

    if (!res.ok) {
        throw new Error('Error al sincronizar los sismos');
    }

    return res.json();
}