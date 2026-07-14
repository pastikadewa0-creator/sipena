<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Setting;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    public function dashboard()
    {
        $todayAttendance = Attendance::where('user_id', auth()->id())
            ->whereDate('date', today())
            ->first();

        $recentLeaves = LeaveRequest::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return view('employee.dashboard', compact('todayAttendance', 'recentLeaves'));
    }

    private function getDistanceFromLatLonInM($lat1, $lon1, $lat2, $lon2) {
        $R = 6371000; // Radius of the earth in m
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = 
            sin($dLat/2) * sin($dLat/2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * 
            sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a)); 
        $d = $R * $c; // Distance in m
        return $d;
    }

    public function clockIn(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB Max
        ]);

        // Get office location from settings (or fallback to defaults)
        $officeLat = Setting::where('key', 'office_latitude')->value('value') ?? '-6.1753924'; // Jakarta default
        $officeLon = Setting::where('key', 'office_longitude')->value('value') ?? '106.8271528';
        $radiusAllowed = Setting::where('key', 'attendance_radius')->value('value') ?? '50'; // 50 meters default

        $distance = $this->getDistanceFromLatLonInM(
            $officeLat, $officeLon,
            $request->latitude, $request->longitude
        );

        if ($distance > $radiusAllowed) {
            return back()->withErrors(['error' => 'You are too far from the office to clock in. Distance: ' . round($distance) . 'm.']);
        }

        $photoPath = '';
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('attendances', 'public');
        }

        Attendance::updateOrCreate(
            ['user_id' => auth()->id(), 'date' => today()],
            [
                'check_in' => now(), 
                'status' => 'hadir',
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'document_url' => $photoPath
            ]
        );

        return back()->with('success', 'Clocked in successfully.');
    }

    public function clockOut(Request $request)
    {
        $attendance = Attendance::where('user_id', auth()->id())
            ->whereDate('date', today())
            ->first();

        if ($attendance) {
            $attendance->check_out = now();
            $attendance->save();
            return back()->with('success', 'Clocked out successfully.');
        }

        return back()->withErrors(['error' => 'No active clock-in found for today.']);
    }

    public function applyLeave(Request $request)
    {
        $request->validate([
            'type' => 'required|in:izin,sakit,cuti,tugas_luar',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
            'document' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $documentPath = '';
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('leaves', 'public');
        }

        LeaveRequest::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'document_url' => $documentPath,
            'status' => 'pending',
        ]);

        $admins = User::where('role', 'admin')->get();
        foreach($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'New Leave Request',
                'message' => auth()->user()->name . ' requested ' . $request->type . ' from ' . $request->start_date,
            ]);
        }

        return back()->with('success', 'Leave request submitted.');
    }
}
