import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  size?: number
}

export default function LoadingSpinner({ message = 'Carregando...', size = 32 }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="animate-spin text-primary-600" size={size} />
      <span className="text-sm text-neutral-500">{message}</span>
    </div>
  )
}
