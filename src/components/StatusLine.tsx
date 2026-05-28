import React, { type ReactNode } from 'react';

type StatusLineProps = {
  children: ReactNode;
  className?: string;
};

export default function StatusLine({ children, className = '' }: StatusLineProps) {
  return <p className={`status ${className}`.trim()}>{children}</p>;
}
