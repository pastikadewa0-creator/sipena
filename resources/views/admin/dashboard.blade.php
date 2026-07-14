@extends('layouts.app')
@section('page-title', 'Dashboard')

@section('content')
<div class="space-y-6">
    {{-- Summary Cards --}}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {{-- Card: Total Karyawan --}}
        <div class="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Total Karyawan Aktif</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">{{ $employeeCount }}</p>
                    <p class="mt-1 text-xs text-gray-400">Karyawan yang sedang aktif bekerja</p>
                </div>
                <div class="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <i data-lucide="users" class="h-6 w-6 text-primary"></i>
                </div>
            </div>
        </div>

        {{-- Card: Izin Menunggu --}}
        <div class="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Izin Menunggu</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">{{ $pendingLeaves }}</p>
                    <p class="mt-1 text-xs text-gray-400">Pengajuan izin belum diproses</p>
                </div>
                <div class="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <i data-lucide="clock" class="h-6 w-6 text-amber-600"></i>
                </div>
            </div>
        </div>

        {{-- Card: Hadir Hari Ini --}}
        <div class="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">{{ $todayAttendance }}</p>
                    <p class="mt-1 text-xs text-gray-400">Karyawan yang sudah absen masuk</p>
                </div>
                <div class="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <i data-lucide="calendar-check" class="h-6 w-6 text-emerald-600"></i>
                </div>
            </div>
        </div>

        {{-- Card: Total Pengajuan --}}
        <div class="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Total Pengajuan</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">{{ $pendingLeaves + ($approvedLeaves ?? 0) }}</p>
                    <p class="mt-1 text-xs text-gray-400">Semua pengajuan izin</p>
                </div>
                <div class="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <i data-lucide="file-text" class="h-6 w-6 text-purple-600"></i>
                </div>
            </div>
        </div>
    </div>

    {{-- Pending Leave Requests --}}
    <div class="bg-white rounded-xl border shadow-sm">
        <div class="p-5 border-b">
            <h3 class="flex items-center gap-2 text-base font-semibold">
                <i data-lucide="clock" class="h-4 w-4 text-amber-500"></i>
                Pengajuan Izin Menunggu Persetujuan
                @if($pendingLeaves > 0)
                    <span class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">{{ $pendingLeaves }}</span>
                @endif
            </h3>
        </div>
        <div class="p-5">
            @if($recentAttendances->isEmpty() && $pendingLeaves == 0)
                <div class="py-8 text-center text-sm text-gray-500">
                    <i data-lucide="calendar-check" class="mx-auto mb-2 h-8 w-8 opacity-30"></i>
                    <p>Tidak ada pengajuan izin yang menunggu</p>
                </div>
            @else
                <div class="divide-y">
                    @foreach($recentAttendances as $attendance)
                        <div class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                            <div class="space-y-0.5">
                                <p class="text-sm font-medium">{{ $attendance->user->name }}</p>
                                <p class="text-xs text-gray-500">{{ $attendance->date }} • {{ ucfirst($attendance->status) }}</p>
                            </div>
                            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">{{ ucfirst($attendance->status) }}</span>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
