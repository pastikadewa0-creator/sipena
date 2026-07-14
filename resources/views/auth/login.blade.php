@extends('layouts.app')

@section('content')
<div class="w-full max-w-md shadow-2xl border border-white/10 bg-white/95 backdrop-blur rounded-xl overflow-hidden">
    {{-- Header --}}
    <div class="space-y-4 text-center pt-8 pb-4 px-8">
        <div class="flex justify-center">
            <div class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <i data-lucide="building-2" class="h-8 w-8 text-white"></i>
            </div>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900">SIPENA</h2>
            <p class="text-sm text-gray-500 mt-1">Sistem Manajemen Absensi Karyawan</p>
        </div>
    </div>

    {{-- Form --}}
    <div class="px-8 pb-8 space-y-5">
        <form method="POST" action="{{ route('login') }}" class="space-y-4" id="login-form">
            @csrf
            <div class="space-y-2">
                <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                <input id="username" name="username" type="text" placeholder="Masukkan username" autocomplete="username" required value="{{ old('username') }}"
                    class="w-full h-11 px-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
            </div>

            <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <div class="relative">
                    <input id="password" name="password" type="password" placeholder="Masukkan password" autocomplete="current-password" required
                        class="w-full h-11 px-3 pr-11 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
                    <button type="button" onclick="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        <i data-lucide="eye" id="eye-icon" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="w-full h-11 text-base font-medium bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors" id="login-submit-btn">
                Masuk
            </button>
        </form>

        {{-- Demo accounts hint --}}
        <div class="rounded-lg bg-gray-100 p-3 text-xs text-gray-500 space-y-1">
            <p class="font-semibold text-gray-600">Akun Demo:</p>
            <p>Admin: <code class="font-mono bg-white px-1 rounded">admin</code> / <code class="font-mono bg-white px-1 rounded">password</code></p>
            <p>Karyawan: <code class="font-mono bg-white px-1 rounded">employee1</code> / <code class="font-mono bg-white px-1 rounded">password</code></p>
        </div>
    </div>
</div>

@push('scripts')
<script>
function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eye-icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}
</script>
@endpush
@endsection
