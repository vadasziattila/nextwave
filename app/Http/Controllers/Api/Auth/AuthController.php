<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            "email" => "required|email",
            "password" => "required",
        ]);

        if (RateLimiter::tooManyAttempts('login:' . $request->ip(), 5)) {
            return response()->json([
                'message'=> 'Too many login attempts. Please try again in ' . RateLimiter::availableIn('login:' . $request->ip()) . ' seconds',
            ], 429);
        }

        RateLimiter::hit('login:' . $request->ip(), decaySeconds: 60);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if ($user->google2fa_secret) {
                // Generate a temporary session ID for 2FA
                $sessionId = base64_encode(bin2hex(random_bytes(length: 16)));
                cache()->put($sessionId, $user->id, now()->addMinutes(10)); // Store the session ID temporarily for 10 minutes

                $encryptedSessionId = encrypt($sessionId);

                return response()->json([
                    "message" => "2FA verification required.",
                    "require_2fa" => true,
                    "session_id" => $encryptedSessionId, // Send session ID to the client
                ], 200);
            }

            $token = $user->createToken("auth_token")->plainTextToken;

            $encryptedToken = encrypt($token);

            return response()->json([
                "message" => "Login successful.",
                "user" => $user,
                "token" => $encryptedToken
            ], 200);
        }

        return response()->json([
            'error' => 'The provided credentials do not match our records.',
        ], 401);
    }

    public function checkToken(Request $request) {
        return response()->json([
            "message" => "Authenticated"
        ],200);
    }

    public function verifyTwoFactor(Request $request)
    {
        $request->validate([
            "session_id" => "required|string",
            "two_factor_code" => "nullable|numeric",
            "two_factor_recovery_code" => "nullable|string"
        ]);

        try {
            $decryptedSessionId = decrypt($request->session_id);
        } catch (\Exception $e) {
            return response()->json([
                "error" => "Invalid or tampered session ID."
            ], 401);
        }

        // Retrieve user ID from the session ID
        $userId = cache()->get($decryptedSessionId);
        if (!$userId) {
            return response()->json([
                "error" => "Invalid or expired session ID."
            ], 401);
        }

        // Fetch the user
        $user = User::find($userId);
        if (!$user || !$user->google2fa_secret) {
            return response()->json([
                "error" => "Two-factor authentication is not enabled for this user."
            ], 400);
        }

        $google2fa = new Google2FA();

        // Verify 2FA Code
        if (!empty($request->two_factor_code)) {
            $isValid = $google2fa->verifyKey($user->google2fa_secret, $request->two_factor_code);

            if ($isValid) {
                // Generate token and delete the session ID
                $token = $user->createToken("auth_token")->plainTextToken;
                $encryptedToken = encrypt($token);
                cache()->forget($request->session_id);

                return response()->json([
                    "message" => "2FA verified successfully.",
                    "user" => $user,
                    "token" => $encryptedToken
                ], 200);
            }

            return response()->json([
                "error" => "Invalid 2FA code."
            ], 401);
        }

        // Verify Recovery Code
        if (!empty($request->two_factor_recovery_code)) {
            $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);

            if (in_array($request->two_factor_recovery_code, $recoveryCodes)) {
                $remainingCodes = array_diff($recoveryCodes, [$request->two_factor_recovery_code]);
                $user->two_factor_recovery_codes = encrypt(json_encode($remainingCodes));
                $user->save();

                // Generate token and delete the session ID
                $token = $user->createToken("auth_token")->plainTextToken;
                $encryptedToken = encrypt($token);
                cache()->forget($request->session_id);

                return response()->json([
                    "message" => "Recovery code verified successfully.",
                    "user" => $user,
                    "token" => $encryptedToken
                ], 200);
            }

            return response()->json([
                "error" => "Invalid recovery code."
            ], 401);
        }

        return response()->json([
            "error" => "2FA or recovery code is required."
        ], 400);
    }
}
