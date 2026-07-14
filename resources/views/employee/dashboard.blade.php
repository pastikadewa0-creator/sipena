@extends('layouts.app')
@section('page-title', 'Dashboard')

@section('content')
@php $firstName = explode(' ', auth()->user()->name)[0]; @endphp

<div class="-mx-4 -mt-4 md:-mx-6 md:-mt-6 min-h-screen bg-gray-100/50">
    {{-- Teal Header Section --}}
    <div class="bg-primary px-6 pb-24 pt-8 text-white relative overflow-hidden">
        {{-- Decorative SVG --}}
        <div class="absolute right-0 top-0 opacity-20 pointer-events-none">
            <svg width="150" height="150" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M45.7,-76.4C58.9,-69.3,69.2,-55.4,77.7,-40.7C86.2,-26,93,-10.5,91.8,4.5C90.6,19.5,81.4,34,71.2,46.7C61,59.4,49.8,70.3,35.9,76.5C22,82.7,5.4,84.2,-10.5,81.4C-26.4,78.6,-41.6,71.5,-53.6,60.6C-65.6,49.7,-74.4,35,-79.6,19.3C-84.8,3.6,-86.4,-13.2,-81,-27.9C-75.6,-42.6,-63.2,-55.2,-49.1,-62.4C-35,-69.6,-19.2,-71.4,-2.2,-68.8C14.8,-66.2,29.6,-59.2,45.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
            </svg>
        </div>
        <div class="relative z-10">
            <h2 class="text-2xl font-bold tracking-tight">Hi, {{ $firstName }}!</h2>
            <p class="mt-1 text-white/90 font-medium">Jangan lupa bahagia</p>
        </div>
    </div>

    {{-- Main Content Area overlapping header --}}
    <div class="-mt-12 relative z-20">
        
        {{-- Quick Actions Card --}}
        <div class="px-4 md:px-6 mb-8">
            <div class="bg-white shadow-xl shadow-primary/10 border-none rounded-2xl overflow-hidden">
                <div class="p-4">
                    <h3 class="text-sm font-semibold text-gray-500 mb-4">Saya ingin membuat pengajuan</h3>
                    <div class="grid grid-cols-4 gap-2">
                        <a href="#attendance" class="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                            <div class="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                                <i data-lucide="clock" class="h-6 w-6 text-indigo-600" style="stroke-width:1.5"></i>
                            </div>
                            <span class="text-[11px] font-medium text-center text-gray-900">Kehadiran</span>
                        </a>
                        <a href="#leave-form" class="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                            <div class="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                                <i data-lucide="stethoscope" class="h-6 w-6 text-red-500" style="stroke-width:1.5"></i>
                            </div>
                            <span class="text-[11px] font-medium text-center text-gray-900">Sakit</span>
                        </a>
                        <a href="#leave-form" class="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                            <div class="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                                <i data-lucide="file-text" class="h-6 w-6 text-blue-500" style="stroke-width:1.5"></i>
                            </div>
                            <span class="text-[11px] font-medium text-center text-gray-900">Izin</span>
                        </a>
                        <a href="#leave-form" class="flex flex-col items-center justify-center gap-2 group cursor-pointer">
                            <div class="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                                <i data-lucide="plane" class="h-6 w-6 text-emerald-500" style="stroke-width:1.5"></i>
                            </div>
                            <span class="text-[11px] font-medium text-center text-gray-900">Cuti</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {{-- White Rounded Bottom Section (Activity Feed) --}}
        <div class="bg-white rounded-t-[2.5rem] min-h-[60vh] px-6 pt-8 pb-32 shadow-sm border-t">
            
            {{-- Absensi Hari Ini --}}
            <div class="mb-8" id="attendance">
                <h3 class="text-sm font-semibold text-gray-500 mb-4">Aktivitas Hari Ini</h3>
                @if($todayAttendance)
                    <div class="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <i data-lucide="calendar-check" class="h-5 w-5 text-primary"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium">Absensi Harian</p>
                                <p class="text-xs text-gray-500 mt-0.5">
                                    Masuk: {{ $todayAttendance->check_in ? \Carbon\Carbon::parse($todayAttendance->check_in)->format('H:i') : '-' }} • 
                                    Pulang: {{ $todayAttendance->check_out ? \Carbon\Carbon::parse($todayAttendance->check_out)->format('H:i') : '-' }}
                                </p>
                            </div>
                        </div>
                        @php
                            $statusColors = ['hadir' => 'bg-emerald-50 text-emerald-700 border-emerald-200', 'terlambat' => 'bg-amber-50 text-amber-700 border-amber-200', 'alpha' => 'bg-red-50 text-red-700 border-red-200'];
                        @endphp
                        <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {{ $statusColors[$todayAttendance->status] ?? '' }}">{{ ucfirst($todayAttendance->status) }}</span>
                    </div>

                    @if(!$todayAttendance->check_out)
                        <form action="{{ route('employee.clock-out') }}" method="POST" class="mt-3">
                            @csrf
                            <button type="submit" class="w-full h-12 flex items-center justify-center gap-2 text-base font-medium border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                                <i data-lucide="log-out" class="h-5 w-5"></i> Absen Pulang
                            </button>
                        </form>
                    @endif
                @else
                    <div class="bg-amber-50 rounded-2xl p-4 flex items-center justify-between border border-amber-100">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <i data-lucide="clock" class="h-5 w-5 text-amber-600"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-amber-900">Belum Absen</p>
                                <p class="text-xs text-amber-700/80 mt-0.5">Lakukan absensi sekarang</p>
                            </div>
                        </div>
                        <a href="#clock-in-section" class="text-xs font-semibold text-primary px-3 py-1.5 bg-primary/10 hover:bg-primary/20 transition-colors rounded-full">Absen Masuk</a>
                    </div>

                    {{-- Clock In Form --}}
                    <div class="mt-4 bg-white rounded-2xl border p-5 space-y-4" id="clock-in-section">
                        <div class="text-center">
                            <p class="text-5xl font-bold tabular-nums tracking-tight text-gray-900" id="live-clock">--:--:--</p>
                            <p class="mt-1 text-sm text-gray-500">{{ \Carbon\Carbon::now()->locale('id')->isoFormat('dddd, D MMMM Y') }}</p>
                        </div>

                        <form id="clockInForm" action="{{ route('employee.clock-in') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                            @csrf
                            <input type="hidden" name="latitude" id="in_lat">
                            <input type="hidden" name="longitude" id="in_lon">
                            
                            <div class="space-y-1.5">
                                <label class="block text-sm font-medium text-gray-700">Lokasi Presensi Anda</label>
                                <div id="location-status" class="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center p-4">
                                    <p class="text-sm text-gray-400">Memuat lokasi...</p>
                                </div>
                            </div>

                            <div class="space-y-1.5">
                                <label class="block text-sm font-medium text-gray-700">Dokumen Pendukung</label>
                                <input type="file" name="photo" accept="image/*" capture="user" required
                                    class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20">
                            </div>

                            <button type="button" onclick="getLocationAndSubmit('clockInForm', 'in_lat', 'in_lon')" id="check-in-btn"
                                class="w-full h-12 flex items-center justify-center gap-2 text-base font-medium bg-primary text-white rounded-xl shadow hover:bg-primary/90 transition-colors">
                                <i data-lucide="log-in" class="h-5 w-5"></i> Absen Masuk
                            </button>
                        </form>
                    </div>
                @endif
            </div>

            {{-- Leave Request Form --}}
            <div class="mb-8" id="leave-form">
                <h3 class="text-sm font-semibold text-gray-500 mb-4">Pengajuan Izin / Cuti</h3>
                <div class="bg-white rounded-2xl border p-5">
                    <form action="{{ route('employee.apply-leave') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                        @csrf
                        <div class="space-y-1.5">
                            <label class="block text-sm font-medium text-gray-700">Jenis</label>
                            <select name="type" required class="w-full h-10 pl-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                                <option value="cuti">Cuti</option>
                                <option value="tugas_luar">Tugas Luar</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1.5">
                                <label class="block text-sm font-medium text-gray-700">Mulai</label>
                                <input type="date" name="start_date" required class="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
                            </div>
                            <div class="space-y-1.5">
                                <label class="block text-sm font-medium text-gray-700">Selesai</label>
                                <input type="date" name="end_date" required class="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-sm font-medium text-gray-700">Alasan</label>
                            <textarea name="reason" rows="3" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"></textarea>
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-sm font-medium text-gray-700">Dokumen Pendukung (Opsional)</label>
                            <input type="file" name="document" accept="image/*,.pdf"
                                class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20">
                        </div>
                        <button type="submit" class="w-full h-11 text-sm font-medium bg-primary text-white rounded-xl shadow hover:bg-primary/90 transition-colors">
                            Ajukan Izin
                        </button>
                    </form>
                </div>
            </div>

            {{-- Recent Leaves --}}
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-semibold text-gray-500">Pengajuan Terbaru</h3>
                </div>
                <div class="space-y-3">
                    @forelse($recentLeaves as $leave)
                        @php
                            $typeLabels = ['izin' => 'Izin', 'sakit' => 'Sakit', 'cuti' => 'Cuti', 'tugas_luar' => 'Tugas Luar'];
                            $leaveStatusColors = ['pending' => 'bg-amber-50 text-amber-700 border-amber-200', 'approved' => 'bg-emerald-50 text-emerald-700 border-emerald-200', 'rejected' => 'bg-red-50 text-red-700 border-red-200'];
                        @endphp
                        <div class="flex items-center justify-between p-3 rounded-2xl border bg-white hover:bg-gray-50 transition-colors">
                            <div>
                                <p class="text-sm font-medium capitalize">{{ $typeLabels[$leave->type] ?? ucfirst(str_replace('_', ' ', $leave->type)) }}</p>
                                <p class="text-xs text-gray-500 mt-0.5">{{ $leave->start_date }} - {{ $leave->end_date }}</p>
                            </div>
                            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {{ $leaveStatusColors[$leave->status] ?? '' }}">{{ ucfirst($leave->status) }}</span>
                        </div>
                    @empty
                        <div class="text-center py-6 border rounded-2xl bg-gray-50 border-dashed text-xs text-gray-500">
                            Belum ada riwayat pengajuan
                        </div>
                    @endforelse
                </div>
            </div>

            {{-- Recent Notifications --}}
            <div>
                <h3 class="text-sm font-semibold text-gray-500 mb-4">Notifikasi Terbaru</h3>
                <div class="space-y-3">
                    @php $recentNotifications = auth()->user()->notifications()->orderBy('created_at', 'desc')->take(3)->get(); @endphp
                    @forelse($recentNotifications as $notif)
                        <div class="flex gap-3 p-3 rounded-2xl border bg-white hover:bg-gray-50 transition-colors">
                            <div class="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                <i data-lucide="bell" class="h-4 w-4 text-blue-500"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium">{{ $notif->title }}</p>
                                <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ $notif->message }}</p>
                                <p class="text-[10px] text-gray-400 mt-1 font-medium">{{ $notif->created_at->diffForHumans() }}</p>
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-6 border rounded-2xl bg-gray-50 border-dashed text-xs text-gray-500">
                            Tidak ada notifikasi baru
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
// Live clock
function updateClock() {
    const el = document.getElementById('live-clock');
    if (el) {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }
}
setInterval(updateClock, 1000);
updateClock();

// Geolocation
function getLocationAndSubmit(formId, latId, lonId) {
    if (navigator.geolocation) {
        const btn = document.getElementById('check-in-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Memproses...'; }
        navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById(latId).value = position.coords.latitude;
            document.getElementById(lonId).value = position.coords.longitude;
            document.getElementById(formId).submit();
        }, function(error) {
            alert('Akses lokasi wajib diizinkan untuk absensi. Error: ' + error.message);
            if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="log-in" class="h-5 w-5"></i> Absen Masuk'; lucide.createIcons(); }
        }, { enableHighAccuracy: true, timeout: 15000 });
    } else {
        alert("Geolocation tidak didukung oleh browser ini.");
    }
}

// Show location status
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
        const el = document.getElementById('location-status');
        if (el) {
            el.innerHTML = '<div class="text-left w-full"><p class="text-xs font-mono text-gray-500">Koordinat: ' + pos.coords.latitude.toFixed(6) + ', ' + pos.coords.longitude.toFixed(6) + '</p><p class="text-xs text-emerald-600 font-medium mt-1">✓ Lokasi berhasil ditemukan</p></div>';
            el.className = 'rounded-xl border bg-gray-50 p-4';
        }
    }, function() {
        const el = document.getElementById('location-status');
        if (el) {
            el.innerHTML = '<p class="text-sm text-red-600">Akses lokasi wajib diizinkan untuk absensi. Silakan periksa pengaturan browser Anda.</p>';
            el.className = 'flex h-[100px] items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 text-center p-4';
        }
    });
}
</script>
@endpush
@endsection
