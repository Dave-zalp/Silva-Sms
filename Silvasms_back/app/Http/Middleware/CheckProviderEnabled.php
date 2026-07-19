<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckProviderEnabled
{
    /**
     * Handle an incoming request.
     *
     * Usage on route: middleware('provider:smsbus') or middleware('provider:herosms')
     */
    public function handle(Request $request, Closure $next, string $provider): Response
    {
        $settings = service_settings();

        $enabledKey = "{$provider}_enabled";

        // 1. Admin global toggle — provider is disabled site-wide
        if (!$settings->{$enabledKey}) {
            return response()->json([
                'success' => false,
                'message' => 'This provider is currently disabled by the administrator.',
            ], 503);
        }

        // 2. User's active provider does not match
        $user = $request->user();

        if ((string) $user->active_provider !== $provider) {
            return response()->json([
                'success'          => false,
                'message'          => 'This provider is not your active server. Switch to it first.',
                'active_provider'  => $user->active_provider,
            ], 403);
        }

        return $next($request);
    }
}
