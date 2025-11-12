"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useExams } from "@/hooks/useExams"
import type { ExamQuestion } from "@/lib/services/examService"

interface TakeExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exam: any
  onExamCompleted?: () => void
}

export function TakeExamDialog({ open, onOpenChange, exam, onExamCompleted }: TakeExamDialogProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { getExamQuestions, submitExam } = useExams()

  // Cargar preguntas cuando se abre el diálogo
  useEffect(() => {
    if (open && exam) {
      setIsLoadingQuestions(true)
      setCurrentQuestion(0)
      setAnswers({})
  setTimeRemaining((exam.timeLimit || 0) * 60)
      
      getExamQuestions(exam.id)
        .then((data) => {
          setQuestions(data)
        })
        .catch((error) => {
          console.error('Error loading questions:', error)
        })
        .finally(() => {
          setIsLoadingQuestions(false)
        })
    }
  }, [open, exam?.id])

  // Timer
  useEffect(() => {
    if (!open || timeRemaining <= 0 || questions.length === 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, timeRemaining, questions.length])

  if (!exam) return null

  const handleAnswerChange = (value: string) => {
    const question = questions[currentQuestion]
    setAnswers({ ...answers, [question.id]: parseInt(value) })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Convertir las claves del objeto answers a strings para el backend
      const answersAsStrings = Object.entries(answers).reduce((acc, [key, value]) => {
        acc[key.toString()] = value.toString()
        return acc
      }, {} as Record<string, string>)
      
      await submitExam({
        examId: exam.id,
        answers: answersAsStrings,
      })
      
      // Recargar los exámenes para mostrar la puntuación actualizada
      if (onExamCompleted) {
        onExamCompleted()
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting exam:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoadingQuestions) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{exam?.title || 'Cargando examen...'}</DialogTitle>
            <DialogDescription>Preparando las preguntas del examen</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (questions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{exam?.title || 'Examen'}</DialogTitle>
            <DialogDescription>No se pudieron cargar las preguntas</DialogDescription>
          </DialogHeader>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay preguntas disponibles para este examen</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{exam.title}</DialogTitle>
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Clock className="w-5 h-5" />
              <span className={timeRemaining < 300 ? "text-red-500" : ""}>{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <DialogDescription>
            Responde todas las preguntas dentro del tiempo límite. Tus respuestas se envían al finalizar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">
                Pregunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold text-lg mb-4">{question.question}</h3>
            <RadioGroup 
              value={answers[question.id]?.toString() || ""} 
              onValueChange={handleAnswerChange} 
              className="space-y-3"
            >
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 border">
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Card>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              Puedes navegar entre preguntas usando los botones de navegación. Tus respuestas se guardarán
              automáticamente.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0 || isSubmitting}>
              Anterior
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                Siguiente
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Finalizar Examen'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
