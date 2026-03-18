import Swal from "../sweetalert2.esm.all.min.js";

export class Modal {
  static async showInfo(icon, title, message) {
    const dialog = await Swal.fire({
      icon: icon,
      title: title,
      html: message,
      returnFocus: false,
    });
    return dialog;
  }

  static async showConfirmation(
    title = null,
    message,
    confirmButtonText = "Confirmar",
    cancelButtonText = "Cancelar",
  ) {
    const result = await Swal.fire({
      icon: "question",
      title: title,
      html: message,
      showDenyButton: true,
      denyButtonText: cancelButtonText,
      confirmButtonText: confirmButtonText,
      returnFocus: false,
    });
    return result;
  }

  static show(modal) {
    const modalEl = document.getElementById(modal);
    const _modal = new bootstrap.Modal(modalEl);
    _modal.show();
  }
}
