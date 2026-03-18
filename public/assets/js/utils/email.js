import { API } from "../service/api.js";
import { Modal } from "../utils/modal.js";
export class Email {
  static async send(data) {
    try {
      const response = await API.fetchBody("/sendMail", "POST", data);

      if (!response.status !== 200) {
        Modal.showInfo("error", "ERRO", `${response.data}`);
      }
      return response.data;
    } catch (error) {
      throw error; // Opcional: relançar o erro para ser tratado em outro lugar
    }
  }
}
