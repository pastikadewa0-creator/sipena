@extends('layouts.app')
@section('page-title', 'Rekap Absensi')

@section('content')
<div class="space-y-5">
    <div>
        <h2 class="text-xl font-semibold">Rekap Absensi</h2>
        <p class="text-sm text-gray-500">Riwayat kehadiran seluruh karyawan</p>
    </div>

    <div class="rounded-xl border bg-white overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr class="bg-gray-50/80">
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Masuk</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Pulang</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @forelse($attendances as $attendance)
                <tr class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-5 py-3.5 whitespace-nowrap text-sm">{{ $attendance->date }}</td>
                    <td class="px-5 py-3.5 whitespace-nowrap">
                        <div class="flex items-center gap-2.5">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {{ strtoupper(substr($attendance->user->name, 0, 1)) }}
                            </div>
                            <span class="font-medium text-sm">{{ $attendance->user->name }}</span>
                        </div>
                    </td>
                    <td class="px-5 py-3.5 whitespace-nowrap font-mono text-sm">{{ $attendance->check_in ? \Carbon\Carbon::parse($attendance->check_in)->format('H:i') : '—' }}</td>
                    <td class="px-5 py-3.5 whitespace-nowrap font-mono text-sm">{{ $attendance->check_out ? \Carbon\Carbon::parse($attendance->check_out)->format('H:i') : '—' }}</td>
                    <td class="px-5 py-3.5 whitespace-nowrap text-sm">
                        @if($attendance->latitude)
                            <a href="https://maps.google.com/?q={{ $attendance->latitude }},{{ $attendance->longitude }}" target="_blank" class="text-primary hover:underline flex items-center gap-1">
                                <i data-lucide="map-pin" class="h-3.5 w-3.5"></i> Map
                            </a>
                        @else
                            <span class="text-gray-400">—</span>
                        @endif
                    </td>
                    <td class="px-5 py-3.5 whitespace-nowrap">
                        @php
                            $statusColors = ['hadir' => 'bg-emerald-50 text-emerald-700 border-emerald-200', 'terlambat' => 'bg-amber-50 text-amber-700 border-amber-200', 'alpha' => 'bg-red-50 text-red-700 border-red-200'];
                        @endphp
                        <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {{ $statusColors[$attendance->status] ?? 'bg-gray-100 text-gray-500 border-gray-200' }}">
                            {{ ucfirst($attendance->status) }}
                        </span>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="py-10 text-center text-sm text-gray-500">Belum ada riwayat absensi</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
