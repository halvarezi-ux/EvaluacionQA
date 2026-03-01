<?php

namespace App\Services;

use App\Actions\ClonarVersionAction;
use App\Models\Boleta;
use App\Models\BoletaVersion;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class VersionamientoService
{
    public function __construct(
        private readonly ClonarVersionAction $clonarVersionAction
    ) {}

    /**
     * Retorna la versión editable de una boleta.
     * Si la versión activa tiene evaluaciones → la clona automáticamente.
     * Si no tiene evaluaciones → devuelve la versión activa para edición directa.
     */
    public function obtenerVersionEditable(Boleta $boleta): array
    {
        $versionActiva = $boleta->versionActiva;

        if (! $versionActiva) {
            throw new HttpException(Response::HTTP_UNPROCESSABLE_ENTITY, 'La boleta no tiene una versión activa.');
        }

        $fueClonadaAutomaticamente = false;

        if ($versionActiva->tieneEvaluaciones()) {
            $versionActiva               = $this->clonarVersionAction->execute($versionActiva);
            $fueClonadaAutomaticamente   = true;
        }

        return [
            'version'                     => $versionActiva,
            'fue_clonada_automaticamente' => $fueClonadaAutomaticamente,
        ];
    }

    /**
     * Activa una versión específica y desactiva todas las demás de la misma boleta.
     * Garantiza que solo exista UNA versión activa por boleta.
     */
    public function activarVersion(BoletaVersion $version): BoletaVersion
    {
        return DB::transaction(function () use ($version) {
            // Desactivar todas las versiones de la boleta
            BoletaVersion::where('boleta_id', $version->boleta_id)
                ->where('id', '!=', $version->id)
                ->update(['es_activa' => false]);

            $version->update(['es_activa' => true]);

            return $version->fresh();
        });
    }

    /**
     * Crea una nueva versión para una boleta existente (sin clonar).
     * Útil para crear versiones en blanco para edición.
     */
    public function crearNuevaVersion(Boleta $boleta): BoletaVersion
    {
        return DB::transaction(function () use ($boleta) {
            $ultimaVersion = $boleta->versiones()->max('numero_version') ?? 0;

            // Desactivar la versión activa actual
            $boleta->versiones()->where('es_activa', true)->update(['es_activa' => false]);

            return BoletaVersion::create([
                'boleta_id'      => $boleta->id,
                'numero_version' => $ultimaVersion + 1,
                'es_activa'      => true,
            ]);
        });
    }

    /**
     * Clona explícitamente la versión activa (llamado desde API endpoint directo).
     */
    public function clonarVersionActiva(Boleta $boleta): BoletaVersion
    {
        $versionActiva = $boleta->versionActiva;

        if (! $versionActiva) {
            throw new HttpException(Response::HTTP_UNPROCESSABLE_ENTITY, 'La boleta no tiene una versión activa para clonar.');
        }

        return $this->clonarVersionAction->execute($versionActiva);
    }
}
