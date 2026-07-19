<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    private const PROVIDERS = ['smsbus', 'herosms'];

    /**
     * Get the user's current active provider and global availability of each provider.
     */
    public function status(): JsonResponse
    {
        $user     = auth()->user();
        $settings = service_settings();

        return response()->json([
            'success' => true,
            'data'    => [
                'active_provider' => $user->active_provider,
                'servers'         => [
                    [
                        'id'              => 1,
                        'key'             => 'smsbus',
                        'name'            => 'SmsBus',
                        'globally_enabled' => (bool) $settings->smsbus_enabled,
                        'is_active'       => $user->active_provider === 'smsbus',
                    ],
                    [
                        'id'              => 2,
                        'key'             => 'herosms',
                        'name'            => 'HeroSMS',
                        'globally_enabled' => (bool) $settings->herosms_enabled,
                        'is_active'       => $user->active_provider === 'herosms',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Switch the user's active provider.
     * Selecting the same provider again deactivates it (sets to null).
     */
    public function switch(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|in:smsbus,herosms',
        ]);

        $provider = $request->provider;
        $settings = service_settings();
        $enabledKey = "{$provider}_enabled";

        // Block if admin has disabled this provider globally
        if (!$settings->{$enabledKey}) {
            return response()->json([
                'success' => false,
                'message' => 'This provider is currently disabled by the administrator.',
            ], 503);
        }

        $user = auth()->user();

        // Toggle off if already active, otherwise switch to new provider
        $newProvider = $user->active_provider === $provider ? null : $provider;

        $user->update(['active_provider' => $newProvider]);

        return response()->json([
            'success'          => true,
            'message'          => $newProvider
                ? "Switched to {$provider}."
                : "Provider deactivated.",
            'active_provider'  => $newProvider,
        ]);
    }
}
