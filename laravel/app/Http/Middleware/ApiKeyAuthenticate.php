<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-API-Key');
        if ($key !== config('app.api_key')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }
        return $next($request);
    }
}
