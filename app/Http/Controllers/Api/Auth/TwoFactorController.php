<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{

    protected $google2fa;

    public function __construct(Google2FA $google2fa)
    {
        $this->google2fa = $google2fa;
    }

    public function enableTwoFactorAuthentication(Request $request)
    {
        $google2fa = new Google2FA();

        $user = $request->user();
        $user->google2fa_secret = $google2fa->generateSecretKey();

        $backupCodes = collect(range(1, 5))->map(fn() => Str::random(10));
        $user->two_factor_recovery_codes = encrypt(json_encode($backupCodes));

        $user->save();

        return response()->json([
            "message" => "Two-factor authenticaton enabled.",
            "qr_code_url" => $this->generateQRCode($user->google2fa_secret),
            "manual_entry_key" => $user->google2fa_secret,
            "recovery_codes" => $backupCodes,
        ]);
    }

    public function disableTwoFactorAuthentication(Request $request)
    {
        $user = $request->user();
        $user->google2fa_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->save();

        return response()->json(['message' => 'Two-factor authentication disabled.']);
    }

    public function regenerateRecoveryCodes(Request $request)
    {
        $user = $request->user();

        if (! $user->google2fa_secret) {
            return response()->json([
                'message' => 'Two-factor authentication is not enabled for this account.',
            ], 401);
        }

        $newBackupCodes = collect(range(1, 5))->map(fn() => Str::random(10));
        $user->two_factor_recovery_codes = encrypt(json_encode($newBackupCodes));
        $user->save();

        return response()->json([
            'message' => 'Recovery codes regenerated successfully.',
            'two_factor_recovery_codes' => $newBackupCodes
        ], 200);
    }

    public function resetTwoFactorAuthentication($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 400);
        }

        $user->google2fa_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->save();

        return response()->json([
            'message' => 'Two-factor authentication has been reset for this user.',
        ], 200);
    }

    private function generateQRCode($secret)
    {
        $google2fa = new Google2FA();

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config("app.name"),
            auth()->user()->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(300),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);

        return 'data:image/svg+xml;base64,' . base64_encode($writer->writeString($qrCodeUrl));
    }
}
