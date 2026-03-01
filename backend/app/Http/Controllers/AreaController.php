<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Http\Requests\StoreAreaRequest;
use App\Http\Resources\AreaResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AreaController extends Controller
{
    /**
     * GET /areas
     * Lista todas las áreas. Acepta filtro ?activa=1|0.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Area::query();

        if ($request->has('activa')) {
            $query->where('activa', (bool) $request->activa);
        }

        $areas = $query->orderBy('nombre')->get();

        return response()->json([
            'data' => AreaResource::collection($areas),
        ]);
    }

    /**
     * POST /areas
     */
    public function store(StoreAreaRequest $request): JsonResponse
    {
        $area = Area::create($request->validated());

        return response()->json([
            'data'    => new AreaResource($area),
            'message' => 'Área creada correctamente',
        ], 201);
    }

    /**
     * GET /areas/{id}
     */
    public function show(string $id): JsonResponse
    {
        $area = Area::findOrFail($id);

        return response()->json([
            'data' => new AreaResource($area),
        ]);
    }

    /**
     * PUT /areas/{id}
     */
    public function update(StoreAreaRequest $request, string $id): JsonResponse
    {
        $area = Area::findOrFail($id);
        $area->update($request->validated());

        return response()->json([
            'data'    => new AreaResource($area),
            'message' => 'Área actualizada correctamente',
        ]);
    }

    /**
     * DELETE /areas/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $area = Area::findOrFail($id);

        // Verificar que no tenga evaluaciones asociadas
        if ($area->versiones()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un área que está asociada a versiones de boleta',
            ], 422);
        }

        $area->delete();

        return response()->json([
            'message' => 'Área eliminada correctamente',
        ]);
    }
}
