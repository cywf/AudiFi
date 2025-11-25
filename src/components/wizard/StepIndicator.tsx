import { cn } from '@/lib/utils'
import { CheckCircle } from '@phosphor-icons/react'

interface StepIndicatorProps {
  steps: readonly string[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={`step-${index}-${step}`} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all',
                    isCompleted && 'bg-accent text-accent-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle size={20} weight="fill" className="sm:w-6 sm:h-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center hidden md:block max-w-[100px] truncate',
                    isCurrent && 'text-foreground',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1 sm:mx-2 transition-colors',
                    isCompleted ? 'bg-accent' : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
