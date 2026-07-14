@extends('layouts.app')
@section('page-title', 'Data Karyawan')

@section('content')
<div class="space-y-5">
    {{-- Header --}}
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 class="text-xl font-semibold">Data Karyawan</h2>
            <p class="text-sm text-gray-500">{{ $employees->count() }} karyawan terdaftar</p>
        </div>
    </div>

    {{-- Table --}}
    <div class="rounded-xl border bg-white overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr class="bg-gray-50/80">
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Jabatan</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @forelse($employees as $employee)
                <tr class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-5 py-3.5 whitespace-nowrap">
                        <div class="flex items-center gap-2.5">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {{ strtoupper(substr($employee->name, 0, 1)) }}
                            </div>
                            <span class="font-medium text-sm text-gray-900">{{ $employee->name }}</span>
                        </div>
                    </td>
                    <td class="px-5 py-3.5 whitespace-nowrap font-mono text-sm text-gray-500">{{ $employee->username }}</td>
                    <td class="px-5 py-3.5 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{{ $employee->email }}</td>
                    <td class="px-5 py-3.5 whitespace-nowrap text-sm hidden sm:table-cell">{{ $employee->position ?: '—' }}</td>
                    <td class="px-5 py-3.5 whitespace-nowrap">
                        <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {{ $employee->isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200' }}">
                            {{ $employee->isActive ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="py-10 text-center text-sm text-gray-500">Tidak ada karyawan ditemukan</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
