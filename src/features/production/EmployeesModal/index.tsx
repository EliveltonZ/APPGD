import { Modal } from '../../../components/Modal'
import type { Employee } from '../../../types/production'
import './index.css'

interface EmployeesModalProps {
  isOpen: boolean
  employees: Employee[]
  onClose: () => void
  onSelect: (employee: Employee) => void
}

export function EmployeesModal({
  isOpen,
  employees,
  onClose,
  onSelect,
}: EmployeesModalProps) {
  function handleSelect(emp: Employee) {
    onSelect(emp)
    onClose()
  }

  return (
    <Modal
      title="Usuários Cadastrados"
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={400}
    >
      <table className="emp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className="emp-table__row"
              onClick={() => handleSelect(emp)}
            >
              <td className="emp-table__id">{emp.id}</td>
              <td>{emp.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}
