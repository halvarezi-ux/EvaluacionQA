<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\MetricsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User management
    Route::apiResource('users', UserController::class);

    // Role management
    Route::apiResource('roles', RoleController::class);

    // Permission management
    Route::apiResource('permissions', PermissionController::class);

    // Form management
    Route::apiResource('forms', FormController::class);

    // Evaluation management
    Route::apiResource('evaluations', EvaluationController::class);
    Route::post('evaluations/{evaluation}/submit', [EvaluationController::class, 'submit']);
    Route::post('evaluations/{evaluation}/responses', [EvaluationController::class, 'storeResponses']);

    // Feedback management
    Route::apiResource('feedback', FeedbackController::class);
    Route::patch('feedback/{feedback}/read', [FeedbackController::class, 'markAsRead']);

    // Metrics and dashboard
    Route::get('/metrics/dashboard', [MetricsController::class, 'dashboard']);
    Route::get('/metrics/users', [MetricsController::class, 'users']);
    Route::get('/metrics/evaluations', [MetricsController::class, 'evaluations']);
    Route::get('/metrics/feedback', [MetricsController::class, 'feedback']);
});
