import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import './index.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <span className="notfound-code">404</span>
        <h1 className="notfound-title">Página não encontrada</h1>
        <p className="notfound-description">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Button onClick={() => navigate('/login')}>Voltar ao início</Button>
      </div>
    </div>
  )
}
