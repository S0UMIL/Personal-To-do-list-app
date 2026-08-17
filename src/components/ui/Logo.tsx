import styles from './Logo.module.css'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 28, className = '' }: LogoProps) {
  return (
    <img
      src="/north-logo.png"
      alt=""
      width={size}
      height={size}
      className={`${styles.logo} ${className}`}
      aria-hidden
    />
  )
}
