<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Admin Account ──
        User::create([
            'username' => 'admin',
            'name'     => 'Administrator',
            'email'    => 'admin@sipena.local',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'position' => 'System Administrator',
            'isActive' => true,
        ]);

        // ── Employee Accounts ──
        $employees = [
            ['username' => 'employee1', 'name' => 'Budi Santoso',   'email' => 'budi@sipena.local',   'position' => 'Staff IT'],
            ['username' => 'employee2', 'name' => 'Siti Rahayu',    'email' => 'siti@sipena.local',    'position' => 'Staff HRD'],
            ['username' => 'employee3', 'name' => 'Andi Pratama',   'email' => 'andi@sipena.local',    'position' => 'Staff Keuangan'],
            ['username' => 'employee4', 'name' => 'Dewi Lestari',   'email' => 'dewi@sipena.local',    'position' => 'Staff Marketing'],
            ['username' => 'employee5', 'name' => 'Rizky Hidayat',  'email' => 'rizky@sipena.local',   'position' => 'Staff Operasional'],
        ];

        foreach ($employees as $emp) {
            User::create([
                'username' => $emp['username'],
                'name'     => $emp['name'],
                'email'    => $emp['email'],
                'password' => Hash::make('password'),
                'role'     => 'karyawan',
                'position' => $emp['position'],
                'isActive' => true,
            ]);
        }

        // ── Default Settings ──
        Setting::updateOrCreate(['key' => 'office_latitude'],  ['value' => '-6.1753924']);
        Setting::updateOrCreate(['key' => 'office_longitude'], ['value' => '106.8271528']);
        Setting::updateOrCreate(['key' => 'attendance_radius'],['value' => '50']);
    }
}
