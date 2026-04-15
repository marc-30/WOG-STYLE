'use client'
import { ReactNode } from 'react'

export const Table = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <table className={`min-w-full ${className}`}>{children}</table>
)
export const TableHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <thead className={className}>{children}</thead>
)
export const TableBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <tbody className={className}>{children}</tbody>
)
export const TableRow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <tr className={className}>{children}</tr>
)
export const TableCell = ({ children, isHeader = false, className = '' }: {
  children: ReactNode; isHeader?: boolean; className?: string
}) => {
  const Tag = isHeader ? 'th' : 'td'
  return <Tag className={className}>{children}</Tag>
}
