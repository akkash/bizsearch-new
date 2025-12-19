import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    TrendingUp,
    DollarSign,
    Settings,
    ChevronLeft,
} from 'lucide-react';

const sidebarItems = [
    { href: '/advisor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/advisor/clients', label: 'Clients', icon: Users },
    { href: '/advisor/deals', label: 'Deal Pipeline', icon: TrendingUp },
    { href: '/advisor/commissions', label: 'Commissions', icon: DollarSign },
];

export function AdvisorLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-background border-r min-h-screen sticky top-0">
                    <div className="p-4 border-b">
                        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="h-4 w-4" />
                            Back to BizSearch
                        </Link>
                    </div>
                    <div className="p-4">
                        <h2 className="font-semibold text-lg mb-1">Advisor Dashboard</h2>
                        <p className="text-sm text-muted-foreground">Manage your clients & deals</p>
                    </div>
                    <nav className="px-2 py-4 space-y-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                        <Link to="/settings">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
