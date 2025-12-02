export class API {
  static async fetchBody(url, method = "POST", payload = {}) {
    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return await API.parseResponse(response);
    } catch (error) {
      return API.networkError(error);
    }
  }

  static async fetchQuery(url) {
    try {
      const response = await fetch(url);
      return await API.parseResponse(response);
    } catch (error) {
      return API.networkError(error);
    }
  }

  static async parseResponse(response) {
    const status = response.status;
    let data = null;

    try {
      data = await response.json();
    } catch {
      try {
        data = await response.text();
      } catch {
        data = null;
      }
    }

    return { status, data };
  }

  static networkError(error) {
    return {
      status: 0, // indica falha de rede
      data: { error: error.message || "Erro de rede inesperado" },
    };
  }
}

export class Service {
  static async getOperadores() {
    const response = await API.fetchQuery("/getOperadores");
    return response.data;
  }

  static async getConfig(params) {
    const url = `/getDate?p_id=${params}`;
    const response = await API.fetchQuery(url);
    return response.data;
  }

  static async setConfig(params) {
    const response = await API.fetchBody("/setDate", "PUT", params);
    return response.data;
  }

  static async getUser(id) {
    const url = `/getUsuario?p_id=${id}`;
    const response = await API.fetchQuery(url);
    return response.data[0];
  }
}
