<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (session('admin_id')) {
            return redirect()->route('admin.dashboard');
        }
        return view('admin.login', ['error' => null]);
    }

    public function login(Request $request)
    {
        $username = trim($request->input('username', ''));
        $password = trim($request->input('password', ''));

        if (empty($username) || empty($password)) {
            return view('admin.login', ['error' => 'Username dan password wajib diisi']);
        }


        $admin = DB::table('admins')->where('username', $username)->first();

        if ($admin && password_verify($password, $admin->password)) {
            session([
                'admin_id'   => $admin->id,
                'admin_user' => $admin->username,
                'admin_name' => $admin->name ?? $admin->username,
            ]);
            return redirect()->route('admin.dashboard');
        }


        if ($username === env('ADMIN_USER') && $password === env('ADMIN_PASS')) {

            $existing = DB::table('admins')->where('username', $username)->first();
            if (!$existing) {
                $id = DB::table('admins')->insertGetId([
                    'username'   => $username,
                    'name'       => 'Admin',
                    'password'   => password_hash($password, PASSWORD_DEFAULT),
                    'created_at' => now(),
                ]);
            } else {
                $id = $existing->id;
            }
            session([
                'admin_id'   => $id,
                'admin_user' => $username,
                'admin_name' => 'Admin',
            ]);
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login', ['error' => 'Username atau password salah']);
    }

    public function logout(Request $request)
    {
        $request->session()->forget(['admin_id', 'admin_user', 'admin_name']);
        return redirect()->route('admin.login');
    }
}
