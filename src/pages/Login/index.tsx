import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useAuth } from '../../context/AuthContext'
import { findUserById } from '../../data/authMocks'
import logo from '../../assets/logo.png'
import './index.css'

interface FormErrors {
  id?: string
  senha?: string
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [id, setId] = useState('')
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [loadingUser, setLoadingUser] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  async function handleIdBlur() {
    if (!id.trim()) return
    setLoadingUser(true)
    setNome('')
    // Simulates network latency; replace with real API call
    await new Promise((r) => setTimeout(r, 400))
    const found = findUserById(id.trim())
    if (found) {
      setNome(found.nome)
      setErrors((prev) => ({ ...prev, id: undefined }))
    } else {
      setErrors((prev) => ({ ...prev, id: 'Usuário não encontrado' }))
    }
    setLoadingUser(false)
  }

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!id.trim()) next.id = 'ID obrigatório'
    else if (!nome) next.id = 'Busque um usuário válido'
    if (!senha) next.senha = 'Senha obrigatória'
    else if (senha.length < 4) next.senha = 'Mínimo 4 caracteres'
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoadingSubmit(true)
    // TODO: replace with real API authentication
    await new Promise((r) => setTimeout(r, 600))
    const user = findUserById(id.trim())
    if (!user) {
      setErrors({ id: 'Usuário não encontrado' })
      setLoadingSubmit(false)
      return
    }
    login(user)
    const from =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ??
      '/dashboard'
    navigate(from, { replace: true })
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
                setId(e.target.value)
                setNome('')
                setErrors((prev) => ({ ...prev, id: undefined }))
              }}
              onBlur={handleIdBlur}
              error={errors.id}
              autoComplete="off"
            />

            <Input
              label="Nome"
              type="text"
              placeholder={loadingUser ? 'Buscando...' : '—'}
              value={nome}
              readOnly
            />
          </div>

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={errors.senha}
            autoComplete="current-password"
            disabled={!nome}
          />

          <Button
            type="submit"
            fullWidth
            loading={loadingSubmit}
            disabled={!nome || loadingUser}
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
