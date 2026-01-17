'use client';

import { useState } from 'react';

type Mode = 'auto' | 'manual';

interface OperatingModeProps {
  initialMode?: Mode;
  onChange?: (mode: Mode) => void;
}

export default function OperatingMode({ initialMode = 'manual', onChange }: OperatingModeProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const handleToggle = () => {
    const newMode = mode === 'auto' ? 'manual' : 'auto';
    setMode(newMode);
    onChange?.(newMode);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">운영모드</h3>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${mode === 'auto' ? 'text-gray-700' : 'text-gray-400'}`}>
          자동
        </span>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
            mode === 'manual' ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              mode === 'manual' ? 'translate-x-9' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${mode === 'manual' ? 'text-gray-700' : 'text-gray-400'}`}>
          수동
        </span>
      </div>
    </div>
  );
}
