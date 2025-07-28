import { Link, useLocation } from 'wouter';
import { Calendar, Users, Target, BarChart3, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Weekly View', href: '/', icon: Calendar },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Targets', href: '/targets', icon: Target },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-support rounded-full flex items-center justify-center">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral">
              Business Planner
            </h1>
            <p className="text-xs text-gray-500">Task & Time Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}>
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
