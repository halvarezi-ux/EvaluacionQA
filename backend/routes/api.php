<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\BoletaController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\SegmentoController;
use App\Http\Controllers\PreguntaController;
use App\Http\Controllers\EvaluacionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// ─── Admin only ────────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:Admin'])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::get('roles', [RoleController::class, 'index']);
    Route::get('roles/{id}', [RoleController::class, 'show']);
});

// ─── Boletas — Admin y QA Lead pueden gestionar ───────────────────────────────
Route::middleware(['auth:sanctum', 'role:Admin,QA Lead'])->group(function () {
    // CRUD de boletas
    Route::apiResource('boletas', BoletaController::class);

    // Lifecycle de boleta
    Route::post('boletas/{id}/activar',               [BoletaController::class, 'activar']);
    Route::post('boletas/{id}/archivar',              [BoletaController::class, 'archivar']);
    Route::post('boletas/{id}/reactivar',             [BoletaController::class, 'reactivar']);
    Route::post('boletas/{id}/clonar-version',        [BoletaController::class, 'clonarVersion']);
    Route::post('boletas/{id}/publicar-borrador/{versionId}', [BoletaController::class, 'publicarBorrador']);
    Route::delete('boletas/{id}/borrador/{versionId}', [BoletaController::class, 'descartarBorrador']);

    // Áreas
    Route::apiResource('areas', AreaController::class);

    // Segmentos (nested bajo versión de boleta)
    Route::get( 'boleta-versiones/{version}/segmentos',  [SegmentoController::class, 'index']);
    Route::post('boleta-versiones/{version}/segmentos',  [SegmentoController::class, 'store']);
    Route::get( 'segmentos/{id}',                        [SegmentoController::class, 'show']);
    Route::put( 'segmentos/{id}',                        [SegmentoController::class, 'update']);
    Route::delete('segmentos/{id}',                      [SegmentoController::class, 'destroy']);
    Route::post('segmentos/{id}/distribuir',             [SegmentoController::class, 'distribuir']);

    // Preguntas (nested bajo segmento)
    Route::get( 'segmentos/{segmento}/preguntas',  [PreguntaController::class, 'index']);
    Route::post('segmentos/{segmento}/preguntas',  [PreguntaController::class, 'store']);
    Route::get( 'preguntas/{id}',                  [PreguntaController::class, 'show']);
    Route::put( 'preguntas/{id}',                  [PreguntaController::class, 'update']);
    Route::delete('preguntas/{id}',                [PreguntaController::class, 'destroy']);
});

// ─── Evaluaciones — Admin, QA Lead y QA pueden gestionar ──────────────────────
Route::middleware(['auth:sanctum', 'role:Admin,QA Lead,QA'])->group(function () {
    Route::get( 'evaluaciones',      [EvaluacionController::class, 'index']);
    Route::post('evaluaciones',      [EvaluacionController::class, 'store']);
    Route::get( 'evaluaciones/{id}', [EvaluacionController::class, 'show']);
});
