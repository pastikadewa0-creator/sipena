<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIPENA — Sistem Manajemen Absensi</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: { DEFAULT: '#0d9488', foreground: '#f8fafc', 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' },
                        sidebar: { DEFAULT: '#0f172a', foreground: '#e2e8f0', accent: '#1e293b', border: '#334155', primary: '#0d9488' },
                    }
                }
            }
        }
    </script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .sidebar-gradient { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
    @auth
        @if(auth()->user()->role === 'admin')
            {{-- ═══════════ ADMIN LAYOUT ═══════════ --}}
            <div class="flex h-screen overflow-hidden">
                {{-- Sidebar --}}
                <aside class="hidden md:flex md:w-64 md:flex-shrink-0 sidebar-gradient flex-col border-r border-sidebar-border">
                    {{-- Logo --}}
                    <div class="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
                        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <i data-lucide="building-2" class="h-5 w-5 text-white"></i>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-sidebar-foreground">SIPENA</p>
                            <p class="text-xs text-sidebar-foreground/50">Sistem Absensi</p>
                        </div>
                    </div>

                    {{-- Role badge --}}
                    <div class="px-4 py-3">
                        <span class="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">⚙️ Admin</span>
                    </div>

                    {{-- Navigation --}}
                    <nav class="flex-1 space-y-1 px-3 py-2">
                        @php
                            $adminNav = [
                                ['route' => 'admin.dashboard', 'icon' => 'layout-dashboard', 'label' => 'Dashboard'],
                                ['route' => 'admin.employees', 'icon' => 'users', 'label' => 'Data Karyawan'],
                                ['route' => 'admin.attendances', 'icon' => 'calendar-check', 'label' => 'Rekap Absensi'],
                                ['route' => 'admin.leaves', 'icon' => 'file-text', 'label' => 'Pengajuan Izin'],
                                ['route' => 'admin.settings', 'icon' => 'settings', 'label' => 'Pengaturan'],
                            ];
                        @endphp
                        @foreach($adminNav as $item)
                            <a href="{{ route($item['route']) }}"
                               class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
                                      {{ request()->routeIs($item['route']) ? 'bg-primary text-white shadow-sm' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground' }}">
                                <i data-lucide="{{ $item['icon'] }}" class="h-4 w-4 shrink-0"></i>
                                <span class="flex-1">{{ $item['label'] }}</span>
                                @if(request()->routeIs($item['route']))
                                    <i data-lucide="chevron-right" class="h-3 w-3 opacity-60"></i>
                                @endif
                            </a>
                        @endforeach
                    </nav>

                    {{-- User info + logout --}}
                    <div class="border-t border-sidebar-border p-4">
                        <div class="mb-3 flex items-center gap-3">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-foreground">
                                {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-medium text-sidebar-foreground">{{ auth()->user()->name }}</p>
                                <p class="text-xs text-sidebar-foreground/50 capitalize">{{ auth()->user()->role }}</p>
                            </div>
                        </div>
                        <form action="{{ route('logout') }}" method="POST">
                            @csrf
                            <button type="submit" class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-red-500/10 hover:text-red-400">
                                <i data-lucide="log-out" class="h-4 w-4"></i>
                                <span>Keluar</span>
                            </button>
                        </form>
                    </div>
                </aside>

                {{-- Main content --}}
                <div class="flex flex-1 flex-col overflow-hidden">
                    {{-- Admin Topbar --}}
                    <header class="flex h-16 items-center justify-between border-b bg-white px-6">
                        <div>
                            <h1 class="text-lg font-semibold">@yield('page-title', 'Dashboard')</h1>
                            <p class="hidden text-xs text-gray-500 sm:block">{{ \Carbon\Carbon::now()->locale('id')->isoFormat('dddd, D MMMM Y') }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            @php $unreadNotifications = auth()->user()->notifications()->where('is_read', false)->orderBy('created_at', 'desc')->get(); @endphp
                            <div class="relative group">
                                <button class="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                                    <i data-lucide="bell" class="h-5 w-5 text-gray-500"></i>
                                    @if($unreadNotifications->count() > 0)
                                        <span class="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{{ $unreadNotifications->count() > 9 ? '9+' : $unreadNotifications->count() }}</span>
                                    @endif
                                </button>
                                <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg overflow-hidden z-20 hidden group-hover:block border border-gray-200">
                                    <div class="py-2">
                                        <div class="px-4 py-2 text-sm font-semibold text-gray-700 border-b">Notifikasi</div>
                                        @forelse($unreadNotifications->take(5) as $notification)
                                            <div class="px-4 py-3 border-b hover:bg-gray-50">
                                                <p class="text-sm font-medium text-gray-900">{{ $notification->title }}</p>
                                                <p class="text-sm text-gray-500 truncate">{{ $notification->message }}</p>
                                                <p class="text-xs text-gray-400 mt-1">{{ $notification->created_at->diffForHumans() }}</p>
                                            </div>
                                        @empty
                                            <div class="px-4 py-6 text-sm text-gray-500 text-center">Belum ada notifikasi baru</div>
                                        @endforelse
                                        @if($unreadNotifications->count() > 0)
                                            <form action="{{ route('notifications.read') }}" method="POST" class="px-4 py-2 text-center border-t">
                                                @csrf
                                                <button type="submit" class="text-sm text-primary font-medium hover:underline">Tandai semua dibaca</button>
                                            </form>
                                        @endif
                                    </div>
                                </div>
                            </div>
                            <div class="flex h-9 items-center gap-2 rounded-full px-2 text-sm font-medium">
                                <div class="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                                    {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                                </div>
                                <span class="hidden sm:block text-gray-700">{{ auth()->user()->name }}</span>
                            </div>
                        </div>
                    </header>

                    <main class="flex-1 overflow-y-auto p-4 md:p-6">
                        @if(session('success'))
                            <div class="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                                <p class="text-sm text-green-700">{{ session('success') }}</p>
                            </div>
                        @endif
                        @if($errors->any())
                            <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                                @foreach($errors->all() as $error)
                                    <p class="text-sm text-red-700">{{ $error }}</p>
                                @endforeach
                            </div>
                        @endif
                        @yield('content')
                    </main>
                </div>
            </div>

        @else
            {{-- ═══════════ EMPLOYEE LAYOUT ═══════════ --}}
            <div class="flex h-screen flex-col overflow-hidden bg-gray-50">
                {{-- Employee Topbar --}}
                @php
                    $isEmpDashboard = request()->routeIs('employee.dashboard');
                    $empNotifications = auth()->user()->notifications()->where('is_read', false)->orderBy('created_at', 'desc')->get();
                @endphp
                <header class="flex h-16 items-center justify-between px-6 transition-colors {{ $isEmpDashboard ? 'bg-primary text-white border-none' : 'border-b bg-white text-gray-900' }}">
                    <div class="flex items-center gap-3">
                        @if(!$isEmpDashboard)
                            <a href="{{ route('employee.dashboard') }}" class="-ml-2 p-2 rounded-full hover:bg-gray-100">
                                <i data-lucide="chevron-left" class="h-6 w-6"></i>
                            </a>
                        @endif
                        <div>
                            <h1 class="text-lg font-semibold">{{ $isEmpDashboard ? 'SIPENA' : trim($__env->yieldContent('page-title', 'SIPENA')) }}</h1>
                            <p class="hidden text-xs sm:block {{ $isEmpDashboard ? 'text-white/80' : 'text-gray-500' }}">{{ \Carbon\Carbon::now()->locale('id')->isoFormat('dddd, D MMMM Y') }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="relative group">
                            <button class="relative h-9 w-9 flex items-center justify-center rounded-full {{ $isEmpDashboard ? 'hover:bg-white/10' : 'hover:bg-gray-100' }}">
                                <i data-lucide="bell" class="h-5 w-5"></i>
                                @if($empNotifications->count() > 0)
                                    <span class="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{{ $empNotifications->count() > 9 ? '9+' : $empNotifications->count() }}</span>
                                @endif
                            </button>
                            <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg overflow-hidden z-20 hidden group-hover:block border border-gray-200 text-gray-900">
                                <div class="py-2">
                                    <div class="px-4 py-2 text-sm font-semibold text-gray-700 border-b">Notifikasi</div>
                                    @forelse($empNotifications->take(5) as $notification)
                                        <div class="px-4 py-3 border-b hover:bg-gray-50">
                                            <div class="flex items-start justify-between gap-4">
                                                <p class="text-sm font-semibold text-gray-900">{{ $notification->title }}</p>
                                                @if(!$notification->is_read)
                                                    <span class="h-2 w-2 mt-1 shrink-0 bg-blue-500 rounded-full"></span>
                                                @endif
                                            </div>
                                            <p class="text-sm text-gray-500 mt-1">{{ $notification->message }}</p>
                                            <p class="text-xs text-gray-400 mt-1">{{ $notification->created_at->diffForHumans() }}</p>
                                        </div>
                                    @empty
                                        <div class="px-4 py-6 text-sm text-gray-500 text-center">Belum ada notifikasi baru</div>
                                    @endforelse
                                    @if($empNotifications->count() > 0)
                                        <form action="{{ route('notifications.read') }}" method="POST" class="px-4 py-2 text-center border-t">
                                            @csrf
                                            <button type="submit" class="text-sm text-primary font-medium hover:underline">Tandai semua dibaca</button>
                                        </form>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <div class="flex h-9 items-center gap-2 rounded-full px-2 text-sm font-medium">
                            <div class="h-8 w-8 flex items-center justify-center rounded-full {{ $isEmpDashboard ? 'bg-white text-primary' : 'bg-primary text-white' }} text-sm font-bold">
                                {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                            </div>
                            <span class="hidden sm:block">{{ auth()->user()->name }}</span>
                        </div>
                    </div>
                </header>

                {{-- Scrollable content area --}}
                <main class="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-24">
                    <div class="mx-auto max-w-4xl">
                        @if(session('success'))
                            <div class="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                                <p class="text-sm text-green-700">{{ session('success') }}</p>
                            </div>
                        @endif
                        @if($errors->any())
                            <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                                @foreach($errors->all() as $error)
                                    <p class="text-sm text-red-700">{{ $error }}</p>
                                @endforeach
                            </div>
                        @endif
                        @yield('content')
                    </div>
                </main>

                {{-- Bottom Navigation Bar --}}
                <nav class="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg">
                    <div class="mx-auto flex h-16 max-w-md items-center justify-around px-4">
                        <a href="{{ route('employee.dashboard') }}" class="flex flex-col items-center justify-center w-20 h-full transition-colors {{ request()->routeIs('employee.dashboard') ? 'text-primary' : 'text-gray-400 hover:text-gray-600' }}">
                            <i data-lucide="aperture" class="h-6 w-6"></i>
                        </a>
                        <a href="{{ route('employee.dashboard') }}#attendance" class="flex flex-col items-center justify-center w-20 h-full transition-colors text-gray-400 hover:text-gray-600">
                            <i data-lucide="calendar-check" class="h-6 w-6"></i>
                        </a>
                        <form action="{{ route('logout') }}" method="POST" class="flex flex-col items-center justify-center w-20 h-full">
                            @csrf
                            <button type="submit" class="flex flex-col items-center text-gray-400 hover:text-gray-600">
                                <i data-lucide="user" class="h-6 w-6"></i>
                            </button>
                        </form>
                    </div>
                </nav>
            </div>
        @endif
    @else
        {{-- ═══════════ GUEST / LOGIN LAYOUT ═══════════ --}}
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
            @if(session('success'))
                <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-lg">
                    <p class="text-sm text-green-700">{{ session('success') }}</p>
                </div>
            @endif
            @if($errors->any())
                <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-lg">
                    @foreach($errors->all() as $error)
                        <p class="text-sm text-red-700">{{ $error }}</p>
                    @endforeach
                </div>
            @endif
            @yield('content')
        </div>
    @endauth

    <script>
        lucide.createIcons();
    </script>
    @stack('scripts')
</body>
</html>
