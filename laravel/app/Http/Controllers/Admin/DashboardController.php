<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{

    public function index()
    {
        $total  = DB::table('feedback')->count();
        $unread = DB::table('feedback')->whereNull('reply')->count();
        $avg    = DB::table('feedback')->where('rating', '>', 0)->avg('rating');
        $admins = DB::table('admins')->orderBy('id')->get();

        return view('admin.dashboard', compact('total', 'unread', 'avg', 'admins'));
    }


    public function listFeedback(Request $request)
    {
        $page   = max(1, (int) $request->query('page', 1));
        $limit  = 15;
        $offset = ($page - 1) * $limit;
        $cat    = $request->query('category', '');
        $search = trim($request->query('search', ''));

        $query = DB::table('feedback');

        if ($cat && in_array($cat, ['saran', 'kritik', 'bug', 'lainnya'])) {
            $query->where('category', $cat);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('pesan', 'LIKE', "%{$search}%")
                  ->orWhere('nama', 'LIKE', "%{$search}%");
            });
        }

        $total = $query->count();
        $rows  = (clone $query)
            ->orderByDesc('created_at')
            ->skip($offset)
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $rows,
            'total'   => $total,
            'page'    => $page,
            'pages'   => (int) ceil($total / $limit),
        ]);
    }


    public function replyFeedback(Request $request, int $id)
    {
        $reply = trim($request->input('reply', ''));
        if (!$id || empty($reply)) {
            return response()->json(['success' => false, 'message' => 'Data tidak lengkap']);
        }
        if (strlen($reply) > 2000) {
            return response()->json(['success' => false, 'message' => 'Balasan terlalu panjang']);
        }

        DB::table('feedback')->where('id', $id)->update([
            'reply'    => $reply,
            'reply_by' => session('admin_name') ?? session('admin_user'),
            'reply_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Balasan berhasil dikirim']);
    }


    public function deleteFeedback(int $id)
    {
        if (!$id) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid']);
        }
        DB::table('feedback')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }


    public function listAdmins()
    {
        $admins = DB::table('admins')
            ->select('id', 'username', 'name', 'created_at')
            ->orderBy('id')
            ->get();

        return response()->json(['success' => true, 'admins' => $admins]);
    }


    public function addAdmin(Request $request)
    {
        $username = trim($request->input('username', ''));
        $name     = trim($request->input('name', ''));
        $password = trim($request->input('password', ''));

        if (empty($username) || empty($password)) {
            return response()->json(['success' => false, 'message' => 'Username dan password wajib diisi']);
        }
        if (strlen($password) < 8) {
            return response()->json(['success' => false, 'message' => 'Password minimal 8 karakter']);
        }

        $exists = DB::table('admins')->where('username', $username)->exists();
        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Username sudah digunakan']);
        }

        $id = DB::table('admins')->insertGetId([
            'username'   => $username,
            'name'       => $name ?: null,
            'password'   => password_hash($password, PASSWORD_DEFAULT),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'admin'   => ['id' => $id, 'username' => $username, 'name' => $name],
        ]);
    }


    public function deleteAdmin(int $id)
    {
        if (!$id) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid']);
        }
        if ($id === (int) session('admin_id')) {
            return response()->json(['success' => false, 'message' => 'Tidak bisa menghapus akun sendiri']);
        }

        $count = DB::table('admins')->count();
        if ($count <= 1) {
            return response()->json(['success' => false, 'message' => 'Minimal harus ada 1 admin']);
        }

        DB::table('admins')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
