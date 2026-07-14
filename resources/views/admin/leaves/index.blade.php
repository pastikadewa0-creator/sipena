@extends('layouts.app')
@section('page-title', 'Pengajuan Izin')

@section('content')
<div class="space-y-5">
    <div>
        <h2 class="text-xl font-semibold">Pengajuan Izin</h2>
        <p class="text-sm text-gray-500">Kelola persetujuan izin karyawan</p>
    </div>

    <div class="rounded-xl border bg-white overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr class="bg-gray-50/80">
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis / Tanggal</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Alasan</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @php
                    $typeLabels = ['izin' => 'Izin', 'sakit' => 'Sakit', 'cuti' => 'Cuti', 'tugas_luar' => 'Tugas Luar'];
                    $statusColors = ['pending' => 'bg-amber-50 text-amber-700 border-amber-200', 'approved' => 'bg-emerald-50 text-emerald-700 border-emerald-200', 'rejected' => 'bg-red-50 text-red-700 border-red-200'];
                @endphp
                @forelse($leaveRequests as $leave)
                <tr class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-5 py-3.5 whitespace-nowrap">
                        <div class="flex items-center gap-2.5">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {{ strtoupper(substr($leave->user->name, 0, 1)) }}
                            </div>
                            <div>
                                <p class="font-medium text-sm text-gray-900">{{ $leave->user->name }}</p>
                                <p class="text-xs text-gray-500">{{ $leave->user->position ?? '' }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-5 py-3.5 whitespace-nowrap">
                        <p class="text-sm font-medium text-gray-900">{{ $typeLabels[$leave->type] ?? ucfirst($leave->type) }}</p>
                        <p class="text-xs text-gray-500">{{ $leave->start_date }}{{ $leave->start_date !== $leave->end_date ? ' – ' . $leave->end_date : '' }}</p>
                    </td>
                    <td class="px-5 py-3.5 text-sm text-gray-500 hidden md:table-cell max-w-[200px]">
                        <p class="truncate" title="{{ $leave->reason }}">{{ Str::limit($leave->reason, 50) }}</p>
                        @if($leave->document_url)
                            <a href="{{ Storage::url($leave->document_url) }}" target="_blank" class="text-primary hover:underline text-xs flex items-center gap-1 mt-1">
                                <i data-lucide="paperclip" class="h-3 w-3"></i> Dokumen
                            </a>
                        @endif
                    </td>
                    <td class="px-5 py-3.5 whitespace-nowrap">
                        <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {{ $statusColors[$leave->status] ?? 'bg-gray-100 text-gray-500' }}">
                            {{ ucfirst($leave->status) }}
                        </span>
                    </td>
                    <td class="px-5 py-3.5 whitespace-nowrap text-right">
                        @if($leave->status === 'pending')
                            <div class="flex justify-end gap-2">
                                <form action="{{ route('admin.leaves.update', $leave->id) }}" method="POST">
                                    @csrf
                                    <input type="hidden" name="status" value="approved">
                                    <button type="submit" class="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                                        <i data-lucide="check" class="h-3.5 w-3.5 inline mr-1"></i>Setujui
                                    </button>
                                </form>
                                <form action="{{ route('admin.leaves.update', $leave->id) }}" method="POST">
                                    @csrf
                                    <input type="hidden" name="status" value="rejected">
                                    <button type="submit" class="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                                        <i data-lucide="x" class="h-3.5 w-3.5 inline mr-1"></i>Tolak
                                    </button>
                                </form>
                            </div>
                        @else
                            <span class="text-xs text-gray-400">Reviewed</span>
                        @endif
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="py-10 text-center text-sm text-gray-500">Tidak ada pengajuan izin</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
