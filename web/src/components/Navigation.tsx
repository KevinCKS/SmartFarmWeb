'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/sensor', label: 'Sensor', icon: '🌡️' },
    { href: '/db', label: 'DB', icon: '📊' },
    { href: '/actuator', label: 'Actuator', icon: '⚙️' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-bold text-gray-900">SmartFarm</span>
          </Link>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-green-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
