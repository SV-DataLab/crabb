import { Badge } from '../../../components/ui/Badge'

type SocioStatusBadgeProps = {
  estadoCarnet?: string | null
}

export function SocioStatusBadge({ estadoCarnet }: SocioStatusBadgeProps) {
  const normalized = (estadoCarnet ?? '').trim().toLowerCase()
  const isValid = normalized === 'valido'

  return (
    <Badge tone={isValid ? 'green' : 'yellow'}>
      {isValid ? 'Válido' : normalized ? 'Revisar estado' : 'No válido'}
    </Badge>
  )
}
