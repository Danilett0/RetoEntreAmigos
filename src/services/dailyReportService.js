const API_BASE_URL = "https://backend-neon-api.vercel.app";

// Registrar o actualizar tarea diaria
export const registrarTarea = async (reportData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrarTarea`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };

    // return { success: true, data: null }; // Simulación de éxito (comentado para usar API real)
     
  } catch (error) {
    console.error('Error al registrar tarea:', error);
    return { success: false, error: error.message };
  }
};

// Obtener historial completo de un usuario
export const obtenerHistorial = async (username, limit = 10, offset = 0) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/historial/${username}?limit=${limit}&offset=${offset}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return { success: false, error: error.message };
  }
};

// Obtener tarea de un día específico
export const obtenerTareaDia = async (username, date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tarea/${username}/${date}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      // Si es 404, significa que no hay reporte para ese día
      if (response.status === 404) {
        return { success: true, data: null };
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener tarea del día:', error);
    return { success: false, error: error.message };
  }
};

// Obtener estadísticas del usuario
export const obtenerEstadisticas = async (username) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/estadisticas/${username}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { success: false, error: error.message };
  }
};