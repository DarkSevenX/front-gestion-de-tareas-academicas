import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ApiErrorProps {
  error: string | null
  onRetry?: () => void
  showRetryButton?: boolean
}

export function ApiError({ error, onRetry, showRetryButton = true }: ApiErrorProps) {
  if (!error) return null

  const isNetworkError = error.toLowerCase().includes('network') || 
                        error.toLowerCase().includes('fetch') ||
                        error.toLowerCase().includes('connection')

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <div className="flex items-start gap-3">
        {isNetworkError ? (
          <WifiOff className="w-5 h-5 text-red-600 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className="text-red-800 font-medium mb-1">
            {isNetworkError ? 'Error de Conexión' : 'Error del Servidor'}
          </h4>
          <AlertDescription className="text-red-700">
            {isNetworkError 
              ? 'No se puede conectar con el servidor. Verifica tu conexión a internet.'
              : error
            }
          </AlertDescription>
          {showRetryButton && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              onClick={onRetry}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center">
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
        {action && action}
      </div>
    </Card>
  )
}

interface LoadingStateProps {
  message?: string
  showSpinner?: boolean
}

export function LoadingState({ message = "Cargando...", showSpinner = true }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {showSpinner && (
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
      )}
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

interface NetworkStatusProps {
  isOnline?: boolean
}

export function NetworkStatus({ isOnline = true }: NetworkStatusProps) {
  if (isOnline) return null

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <WifiOff className="w-4 h-4 text-orange-600" />
      <AlertDescription className="text-orange-700">
        Sin conexión a internet. Algunos datos pueden estar desactualizados.
      </AlertDescription>
    </Alert>
  )
}