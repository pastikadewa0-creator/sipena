<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Setting;
use App\Models\Notification;

class AdminController extends Controller
{
    public function dashboard()
    {
        $employeeCount = User::where('role', 'karyawan')->count();
        $todayAttendance = Attendance::whereDate('date', today())->count();
        $pendingLeaves = LeaveRequest::where('status', 'pending')->count();
        $approvedLeaves = LeaveRequest::where('status', 'approved')->count();

        // Advanced: Get recent attendances
        $recentAttendances = Attendance::with('user')->orderBy('created_at', 'desc')->take(5)->get();

        return view('admin.dashboard', compact('employeeCount', 'todayAttendance', 'pendingLeaves', 'approvedLeaves', 'recentAttendances'));
    }

    public function employees()
    {
        $employees = User::where('role', 'karyawan')->get();
        return view('admin.employees.index', compact('employees'));
    }

    // Example methods for full CRUD
    public function storeEmployee(Request $request)
    {
        // Implementation for adding employee
    }

    public function attendances()
    {
        $attendances = Attendance::with('user')->orderBy('date', 'desc')->get();
        return view('admin.attendances.index', compact('attendances'));
    }

    public function leaveRequests()
    {
        $leaveRequests = LeaveRequest::with('user')->orderBy('created_at', 'desc')->get();
        return view('admin.leaves.index', compact('leaveRequests'));
    }

    public function updateLeaveStatus(Request $request, $id)
    {
        $leave = LeaveRequest::findOrFail($id);
        $leave->status = $request->status;
        $leave->reviewed_by = auth()->id();
        $leave->reviewed_at = now();
        $leave->save();

        Notification::create([
            'user_id' => $leave->user_id,
            'title' => 'Leave Request ' . ucfirst($request->status),
            'message' => 'Your leave request starting ' . $leave->start_date . ' has been ' . $request->status . '.',
        ]);

        return back()->with('success', 'Leave request status updated.');
    }

    public function settings()
    {
        $settings = Setting::pluck('value', 'key');
        return view('admin.settings', compact('settings'));
    }

    public function updateSettings(Request $request)
    {
        $data = $request->except('_token');
        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return back()->with('success', 'Settings updated successfully.');
    }
}
