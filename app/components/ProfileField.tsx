'use client';

import React from 'react';

type Props = {
  label: string;
  name: string;
  value: string;
  isEditing: boolean;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ProfileField({
  label,
  name,
  value,
  isEditing,
  type = 'text',
  onChange,
}: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-base text-gray-700 whitespace-pre-line">{value}</p>
      )}
    </div>
  );
}