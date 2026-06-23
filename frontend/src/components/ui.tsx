import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'glass'; size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25',
    outline: 'border border-white/20 text-white hover:bg-white/10 backdrop-blur-md',
    ghost: 'text-slate-700 hover:bg-slate-100',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-600/25',
    glass: 'bg-white/10 text-white border border-white/20 backdrop-blur-xl hover:bg-white/20',
  }
  const sizes = { sm: 'px-3.5 py-2 text-sm rounded-lg', md: 'px-5 py-2.5 text-sm rounded-xl', lg: 'px-7 py-3.5 text-base rounded-2xl' }
  return (
    <button className={cn('font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2', variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-3xl bg-white border border-slate-200/70 shadow-sm', className)}>{children}</div>
}

export function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl', className)}>{children}</div>
}

export function Badge({ className, children, color = 'indigo' }: { className?: string; children: ReactNode; color?: 'indigo' | 'green' | 'amber' | 'rose' | 'slate' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border', colors[color], className)}>{children}</span>
}

export function Input({ className, label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>}
      <input className={cn('w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition', className)} {...props} />
    </label>
  )
}

export function Select({ className, label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>}
      <select className={cn('w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition', className)} {...props}>
        {children}
      </select>
    </label>
  )
}

export function Textarea({ className, label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>}
      <textarea className={cn('w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none', className)} {...props} />
    </label>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cn('max-w-3xl', center && 'mx-auto text-center')}>
      {eyebrow && <span className="inline-block text-sm font-bold uppercase tracking-widest text-indigo-600 mb-3">{eyebrow}</span>}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-slate-600 leading-relaxed">{subtitle}</p>}
    </div>
  )
}
