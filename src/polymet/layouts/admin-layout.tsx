import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart3,
    Shield,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    Home,
    Building2,
    FileCheck,
    Flag,
} from 'lucide-react';

const sidebarItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin',
        exact: true
    },
    {
        title: 'Users',
        icon: Users,
        href: '/admin/users'
    },
    {
        title: 'Listings',
        icon: Building2,
        href: '/admin/listings'
    },
    {
        title: 'Documents',
        icon: FileCheck,
        href: '/admin/documents'
    },
    {
        title: 'Content',
        icon: FileText,
        href: '/admin/content'
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        href: '/admin/analytics'
    },
    {
        title: 'Fraud Alerts',
        icon: Shield,
        href: '/admin/fraud'
    },
    {
        title: 'Feature Flags',
        icon: Flag,
        href: '/admin/feature-flags'
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/admin/settings'
    },
];

export function AdminLayout() {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    const NavItems = () => (
        <>
            {sidebarItems.map((item) => (
                <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive(item.href, item.exact)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                </Link>
            ))}
        </>
    );

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <span className="ml-4 font-semibold">Admin Dashboard</span>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-full bg-background border-r z-50 transition-all duration-200',
                    sidebarCollapsed ? 'w-16' : 'w-64',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b">
                        {!sidebarCollapsed && (
                            <Link to="/admin" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="font-bold text-lg">Admin</span>
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden lg:flex"
                        >
                            <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 py-4">
                        <nav className="space-y-1 px-2">
                            <NavItems />
                        </nav>
                    </ScrollArea>

                    <Separator />

                    {/* Bottom Section */}
                    <div className="p-4 space-y-2">
                        <Link
                            to="/"
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                            )}
                        >
                            <Home className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && <span>Back to Site</span>}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    'min-h-screen transition-all duration-200 pt-16 lg:pt-0',
                    sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                )}
            >
                {/* Top Bar */}
                <header className="h-16 bg-background border-b flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-lg font-semibold capitalize">
                            {location.pathname === '/admin'
                                ? 'Dashboard'
                                : location.pathname.split('/').pop()?.replace(/-/g, ' ')}
                        </h1>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={profile?.avatar_url || ''} />
                                    <AvatarFallback>
                                        {profile?.display_name?.charAt(0) || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline-block">
                                    {profile?.display_name || 'Admin'}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/profile">
                                    <Users className="h-4 w-4 mr-2" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/profile/settings">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
