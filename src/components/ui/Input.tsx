import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <label className={styles.field}>
        {label && <span className={styles.label}>{label}</span>}
        <input ref={ref} id={inputId} className={`${styles.input} ${className}`} {...props} />
        {hint && <span className={styles.hint}>{hint}</span>}
      </label>
    )
  },
)
Input.displayName = 'Input'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, className = '', ...props }, ref) => (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea ref={ref} className={`${styles.input} ${styles.textarea} ${className}`} {...props} />
    </label>
  ),
)
TextArea.displayName = 'TextArea'
