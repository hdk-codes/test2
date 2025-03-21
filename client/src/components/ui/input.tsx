// src/components/ui/input.tsx
import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`p-2 border rounded ${props.className}`} />;
}

// src/components/ui/button.tsx
import { ButtonHTMLAttributes } from 'react';

export function Button({ variant, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' }) {
  return (
    <button
      {...props}
      className={`p-2 rounded ${variant === 'outline' ? 'border border-gray-300' : 'bg-blue-500 text-white'} ${props.className}`}
    />
  );
}