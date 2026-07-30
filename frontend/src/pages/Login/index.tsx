import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../context/AuthContext";
import { fetchUserName, loginUser } from "../../services/usuarios";
import logo from "../../assets/logo.png";
import "./index.css";

interface FormErrors {
  id?: string;
  senha?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [id, setId] = useState("");
  const [name, setNome] = useState("");
  const [password, setSenha] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (name) passwordRef.current?.focus();
  }, [name]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleIdBlur() {
    if (!id.trim()) return;
    setLoadingUser(true);
    setNome("");
    try {
      const result = await fetchUserName(Number(id.trim()));
      if (!result) {
        setErrors((prev) => ({ ...prev, id: "Usuário não encontrado" }));
      } else if (!result.ativo) {
        setNome(result.nome);
        setErrors((prev) => ({ ...prev, id: "INATIVO" }));
      } else {
        setNome(result.nome);
        setErrors((prev) => ({ ...prev, id: undefined }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, id: "Usuário não encontrado" }));
    } finally {
      setLoadingUser(false);
    }
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!id.trim()) next.id = "ID obrigatório";
    else if (!name) next.id = "Busque um usuário válido";
    if (!password) next.senha = "Senha obrigatória";
    else if (password.length < 4) next.senha = "Mínimo 4 caracteres";
    return next;
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoadingSubmit(true);
    try {
      const result = await loginUser(Number(id.trim()), password);
      if (!result) {
        setErrors({ senha: "ID ou senha inválidos" });
        return;
      }
      login(result.authUser, result.token);
      const from =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ??
        "/";
      navigate(from, { replace: true });
    } catch {
      setErrors({ senha: "Erro ao autenticar. Tente novamente." });
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="GD" className="login-logo" />
          <p className="login-subtitle">Acesse sua conta para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-row">
            <Input
              label="ID"
              type="text"
              inputMode="numeric"
              placeholder="000"
              maxLength={3}
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setNome("");
                setErrors((prev) => ({ ...prev, id: undefined }));
              }}
              onBlur={handleIdBlur}
              error={errors.id}
              autoComplete="off"
            />

            <Input
              label="Nome"
              type="text"
              placeholder={loadingUser ? "Buscando..." : "—"}
              value={name}
              disabled
            />
          </div>

          <Input
            ref={passwordRef}
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setSenha(e.target.value)}
            error={errors.senha}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            loading={loadingSubmit}
            disabled={!name || !!errors.id || loadingUser}
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
