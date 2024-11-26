<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\TwoFactorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/two-factor/verify', [AuthController::class, 'verifyTwoFactor']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/check-token', [AuthController::class, 'checkToken']);

    Route::post('/two-factor/enable', [TwoFactorController::class, 'enableTwoFactorAuthentication']);
    Route::post('/two-factor/disable', [TwoFactorController::class, 'disableTwoFactorAuthentication']);

    Route::post('/two-factor/regenerate-recovery-codes', [TwoFactorController::class,'regenerateRecoveryCodes']);

    Route::post('/two-factor/reset-two-factor/{userId}', [TwoFactorController::class,'resetTwoFactorAuthentication']);
});
