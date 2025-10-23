import React from 'react';

type Props = {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
};

export default function Field({ label, value, onChange, type = 'text', placeholder, className }: Props) {
  return (
    <label className={`field ${className ?? ''}`}>
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type={type}
        value={String(value)}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}