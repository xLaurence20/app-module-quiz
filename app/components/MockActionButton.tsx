'use client'

export default function MockActionButton({ 
  label, 
  message, 
  className 
}: { 
  label: string, 
  message: string, 
  className: string 
}) {
  return (
    <button 
      onClick={() => alert(message)} 
      className={className}
    >
      {label}
    </button>
  )
}