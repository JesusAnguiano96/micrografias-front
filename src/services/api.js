const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,

  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
  },

  micrographs: {
    upload: `${API_BASE_URL}/api/micrographs/upload`,
    list: `${API_BASE_URL}/api/micrographs`,
    originalFile: (filename) =>
      `${API_BASE_URL}/api/files/original/${filename}`,
    segmentedFile: (filename) =>
      `${API_BASE_URL}/api/files/segmented/${filename}`,
  },

  analysis: {
    run: `${API_BASE_URL}/api/analysis/run`,
    history: `${API_BASE_URL}/api/analysis/history`,
    getById: (analysisId) => `${API_BASE_URL}/api/analysis/${analysisId}`,
  },
};

export async function apiGet(url) {
  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
}

export async function apiPostJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
}

export async function apiPostFormData(url, formData) {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
}
