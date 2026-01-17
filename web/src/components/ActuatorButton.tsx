'use client';

interface ActuatorButtonProps {
  label: string;
  icon: string;
  enabled: boolean;
  onToggle: () => void;
  loading?: boolean;
  variant?: 'onoff' | 'openclose';
}

export default function ActuatorButton({
  label,
  icon,
  enabled,
  onToggle,
  loading,
  variant = 'onoff',
}: ActuatorButtonProps) {
  const onLabel = variant === 'onoff' ? 'ON' : '열기';
  const offLabel = variant === 'onoff' ? 'OFF' : '닫기';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onToggle}
            disabled={loading || enabled}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              enabled
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {onLabel}
          </button>
          <button
            onClick={onToggle}
            disabled={loading || !enabled}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              !enabled
                ? 'bg-gray-200 text-gray-700 cursor-default'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {offLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
