@extends('layouts.app')
@section('page-title', 'Pengaturan')

@section('content')
<div class="space-y-5">
    <div>
        <h2 class="text-xl font-semibold">Pengaturan</h2>
        <p class="text-sm text-gray-500">Konfigurasi lokasi absensi dan radius</p>
    </div>

    <div class="bg-white rounded-xl border shadow-sm max-w-2xl">
        <div class="p-5 border-b">
            <h3 class="flex items-center gap-2 text-base font-semibold">
                <i data-lucide="map-pin" class="h-4 w-4 text-primary"></i>
                Lokasi Absensi
            </h3>
        </div>
        <form action="{{ route('admin.settings.update') }}" method="POST" class="p-5 space-y-4">
            @csrf
            <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">Latitude Kantor</label>
                <input type="text" name="office_latitude" value="{{ $settings['office_latitude'] ?? '-6.1753924' }}"
                    class="w-full h-10 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
                <p class="text-xs text-gray-400">Contoh: -6.1753924 (Jakarta)</p>
            </div>
            
            <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">Longitude Kantor</label>
                <input type="text" name="office_longitude" value="{{ $settings['office_longitude'] ?? '106.8271528' }}"
                    class="w-full h-10 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
            </div>

            <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">Radius Maksimum (meter)</label>
                <input type="number" name="attendance_radius" value="{{ $settings['attendance_radius'] ?? '50' }}"
                    class="w-full h-10 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
            </div>

            <button type="submit" class="h-10 px-6 text-sm font-medium bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors">
                Simpan Pengaturan
            </button>
        </form>
    </div>
</div>
@endsection
