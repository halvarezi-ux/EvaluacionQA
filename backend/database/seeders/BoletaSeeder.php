<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BoletaSeeder extends Seeder
{
    public function run(): void
    {
        $adminId      = DB::table('users')->where('user', 'admin')->value('id')   ?? 1;
        $qaLeadId     = DB::table('users')->where('user', 'qalead')->value('id')  ?? 2;
        $areaAtencion = DB::table('areas')->where('nombre', 'Atención al Cliente')->value('id') ?? 1;
        $areaSoporte  = DB::table('areas')->where('nombre', 'Soporte Técnico')->value('id')     ?? 2;

        // ─── Boleta 1: Atención Telefónica (draft) ─────────────────────
        $boleta1Id = DB::table('boletas')->insertGetId([
            'nombre'           => 'Boleta Atención Telefónica',
            'descripcion'      => 'Evaluación de calidad para interacciones de atención al cliente vía llamada.',
            'pais'             => 'Guatemala',
            'cliente'          => 'Banco Central',
            'tipo_interaccion' => 'llamada',
            'total_global'     => 100.00,
            'estado'           => 'draft',
            'created_by'       => $adminId,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        $version1Id = DB::table('boleta_versiones')->insertGetId([
            'boleta_id'      => $boleta1Id,
            'numero_version' => 1,
            'es_activa'      => true,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        DB::table('boleta_version_area')->insert([
            ['boleta_version_id' => $version1Id, 'area_id' => $areaAtencion],
        ]);

        // Segmento normal: Saludo (peso 30)
        $seg1Id = DB::table('segmentos')->insertGetId([
            'boleta_version_id' => $version1Id, 'nombre' => 'Saludo y Presentación',
            'tipo' => 'normal', 'peso' => 30.00, 'penalizacion' => null, 'orden' => 1,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('preguntas')->insert([
            ['segmento_id' => $seg1Id, 'texto' => '¿El agente utilizó el saludo corporativo?', 'tipo' => 'si_no', 'peso' => 15.00, 'anula_segmento' => false, 'comentario_requerido' => 'si_es_no', 'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['segmento_id' => $seg1Id, 'texto' => '¿El agente se identificó con nombre y área?',  'tipo' => 'si_no', 'peso' => 15.00, 'anula_segmento' => false, 'comentario_requerido' => 'nunca',   'orden' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Segmento normal: Resolución (peso 50)
        $seg2Id = DB::table('segmentos')->insertGetId([
            'boleta_version_id' => $version1Id, 'nombre' => 'Resolución del Caso',
            'tipo' => 'normal', 'peso' => 50.00, 'penalizacion' => null, 'orden' => 2,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('preguntas')->insert([
            ['segmento_id' => $seg2Id, 'texto' => '¿El agente resolvió el caso en la primera llamada?', 'tipo' => 'si_no', 'peso' => 30.00, 'anula_segmento' => false, 'comentario_requerido' => 'si_es_no', 'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['segmento_id' => $seg2Id, 'texto' => '¿El agente ofreció alternativas si no pudo resolver?', 'tipo' => 'si_no', 'peso' => 20.00, 'anula_segmento' => false, 'comentario_requerido' => 'nunca',   'orden' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Segmento normal: Cierre (peso 20)
        $seg3Id = DB::table('segmentos')->insertGetId([
            'boleta_version_id' => $version1Id, 'nombre' => 'Cierre de Llamada',
            'tipo' => 'normal', 'peso' => 20.00, 'penalizacion' => null, 'orden' => 3,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('preguntas')->insert([
            ['segmento_id' => $seg3Id, 'texto' => '¿El agente realizó cierre ofreciendo ayuda adicional?', 'tipo' => 'si_no', 'peso' => 20.00, 'anula_segmento' => false, 'comentario_requerido' => 'nunca', 'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Segmento crítico: Cumplimiento regulatorio (penalización 20)
        $seg4Id = DB::table('segmentos')->insertGetId([
            'boleta_version_id' => $version1Id, 'nombre' => 'Cumplimiento Regulatorio',
            'tipo' => 'critico', 'peso' => null, 'penalizacion' => 20.00, 'orden' => 4,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('preguntas')->insert([
            ['segmento_id' => $seg4Id, 'texto' => '¿El agente divulgó el aviso de privacidad?',        'tipo' => 'si_no', 'peso' => null, 'anula_segmento' => false, 'comentario_requerido' => 'si_es_no', 'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['segmento_id' => $seg4Id, 'texto' => '¿El agente solicitó consentimiento de grabación?',  'tipo' => 'si_no', 'peso' => null, 'anula_segmento' => true,  'comentario_requerido' => 'si_es_no', 'orden' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Segmento resumen
        $seg5Id = DB::table('segmentos')->insertGetId([
            'boleta_version_id' => $version1Id, 'nombre' => 'Observaciones Generales',
            'tipo' => 'resumen', 'peso' => null, 'penalizacion' => null, 'orden' => 5,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('preguntas')->insert([
            ['segmento_id' => $seg5Id, 'texto' => 'Comentarios adicionales del evaluador.', 'tipo' => 'texto_libre', 'peso' => null, 'anula_segmento' => false, 'comentario_requerido' => 'nunca', 'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ─── Boleta 2: Chat Soporte Técnico (activa) ───────────────────
        $boleta2Id = DB::table('boletas')->insertGetId([
            'nombre'           => 'Boleta Chat Soporte Técnico',
            'descripcion'      => 'Evaluación de calidad para interacciones de soporte técnico vía chat.',
            'pais'             => 'México',
            'cliente'          => 'TechCorp SA',
            'tipo_interaccion' => 'chat',
            'total_global'     => 100.00,
            'estado'           => 'activa',
            'created_by'       => $qaLeadId,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        $version2Id = DB::table('boleta_versiones')->insertGetId([
            'boleta_id'      => $boleta2Id,
            'numero_version' => 1,
            'es_activa'      => true,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        DB::table('boleta_version_area')->insert([
            ['boleta_version_id' => $version2Id, 'area_id' => $areaSoporte],
        ]);

        // Segmento normal: Habilidades comunicativas (peso 40)
        $bseg1Id = DB::table('segmentos')->insertGetId([
            'boleta_version_id' => $version2Id, 'nombre' => 'Habilidades Comunicativas',
            'tipo' => 'normal', 'peso' => 40.00, 'penalizacion' => null, 'orden' => 1,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $pMultipleId = DB::table('preguntas')->insertGetId([
            'segmento_id' => $bseg1Id, 'texto' => '¿Cómo calificarías la comunicación escrita del agente?',
            'tipo' => 'opcion_multiple', 'peso' => 20.00, 'anula_segmento' => false,
            'comentario_requerido' => 'nunca', 'orden' => 1, 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('pregunta_opciones')->insert([
            ['pregunta_id' => $pMultipleId, 'texto' => 'Excelente',  'valor' => 20.00, 'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['pregunta_id' => $pMultipleId, 'texto' => 'Buena',      'valor' => 15.00, 'orden' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['pregunta_id' => $pMultipleId, 'texto' => 'Regular',    'valor' => 10.00, 'orden' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['pregunta_id' => $pMultipleId, 'texto' => 'Deficiente', 'valor' => 0.00,  'orden' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);
        DB::table('preguntas')->insert([
            ['segmento_id' => $bseg1Id, 'texto' => '¿El agente respondió en menos de 2 minutos por turno?', 'tipo' => 'si_no', 'peso' => 20.00, 'anula_segmento' => false, 'comentario_requerido' => 'si_es_no', 'orden' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Segmento normal: Resolución técnica (peso 60)
        $bseg2Id = DB::table('segmentos')->insertGetId([
            'boleta_version_id' => $version2Id, 'nombre' => 'Resolución Técnica',
            'tipo' => 'normal', 'peso' => 60.00, 'penalizacion' => null, 'orden' => 2,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('preguntas')->insert([
            ['segmento_id' => $bseg2Id, 'texto' => '¿El agente diagnosticó correctamente el problema?',     'tipo' => 'si_no',      'peso' => 30.00, 'anula_segmento' => true,  'comentario_requerido' => 'si_es_no',   'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['segmento_id' => $bseg2Id, 'texto' => '¿Qué porcentaje del problema fue resuelto en el chat?', 'tipo' => 'porcentaje', 'peso' => 30.00, 'anula_segmento' => false, 'comentario_requerido' => 'si_penaliza', 'orden' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Segmento crítico: Uso de herramientas (penalización 15)
        $bseg3Id = DB::table('segmentos')->insertGetId([
            'boleta_version_id' => $version2Id, 'nombre' => 'Uso Correcto de Herramientas',
            'tipo' => 'critico', 'peso' => null, 'penalizacion' => 15.00, 'orden' => 3,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('preguntas')->insert([
            ['segmento_id' => $bseg3Id, 'texto' => '¿El agente escaló el ticket dentro del CRM correctamente?', 'tipo' => 'si_no', 'peso' => null, 'anula_segmento' => false, 'comentario_requerido' => 'si_es_no', 'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->command->info('✓ BoletaSeeder: 2 boletas creadas con sistema de segmentos tipados (normal/critico/resumen)');
    }
}
