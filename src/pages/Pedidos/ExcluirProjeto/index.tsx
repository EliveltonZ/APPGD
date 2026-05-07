import { AppLayout } from "../../../components/Layout/AppLayout";
import { useToast } from "../../../context/ToastContext";

export function ExcluirProjetoPage() {
  const toast = useToast();

  return (
    <AppLayout pageTitle="Excluir Projeto">
      <div style={{ padding: "2rem" }}>
        <h1>Excluir Projeto</h1>
        <p>Página em desenvolvimento.</p>
      </div>
      <button
        className="modal"
        onClick={() => toast.success("Operação realizada com sucesso.")}
      >
        Notificar
      </button>
    </AppLayout>
  );
}
