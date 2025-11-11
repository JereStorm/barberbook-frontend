import Swal from "sweetalert2";

class AlertService {
  static async confirm(message: string): Promise<boolean> {
    const result = await Swal.fire({
      title: "Confirmar Accion",
      text: message,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Confirmar",
      cancelButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
    });
    return result.isConfirmed;
  }

  static success(message: string) {
    Swal.fire({
      icon: "success",
      title: message,
      timer: 1500,
      showConfirmButton: false,
    });
  }

  static error(message: string) {
    Swal.fire({
      icon: "error",
      title: message,
      timer: 1500,
      showConfirmButton: false,
    });
  }
}

export default AlertService;
