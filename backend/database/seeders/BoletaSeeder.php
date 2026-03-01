<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BoletaSeeder extends Seeder
{
    public function run(): void
    {
        $adminId      = DB::table('users')->where('user', 'admin')->value('id')  ?? 1;
        $qaLeadId     = DB::table('users')->where('user', 'qalead')->value('id') ?? 2;
        $areaAtencion = DB::table('areas')->where('nombre', 'Atencion al Cliente')->value('id') ?? 1;
        $areaSoporte  = DB::table('areas')->where('nombre', 'Soporte Tecnico')->value('id')     ?? 2;

        // BOLETA 1: Atencion Telefonica -- ACTIVA
        $b1 = DB::table('boletas')->insertGetId(['nombre'=>'Boleta Atencion Telefonica','descripcion'=>'Evaluacion de calidad para interacciones de atencion al cliente via llamada.','pais'=>'Guatemala','cliente'=>'Banco Central','tipo_interaccion'=>'llamada','total_global'=>100.00,'estado'=>'activa','created_by'=>$adminId,'created_at'=>now(),'updated_at'=>now()]);
        $v1 = DB::table('boleta_versiones')->insertGetId(['boleta_id'=>$b1,'numero_version'=>1,'es_activa'=>true,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('boleta_version_area')->insert([['boleta_version_id'=>$v1,'area_id'=>$areaAtencion]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v1,'nombre'=>'Saludo y Presentacion','tipo'=>'normal','peso'=>25.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente utilizo el saludo corporativo?','tipo'=>'si_no','peso'=>15.00,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>15.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente se identifico con nombre y area?','tipo'=>'si_no','peso'=>10.00,'anula_segmento'=>false,'comentario_requerido'=>'nunca','orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>10.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v1,'nombre'=>'Resolucion del Caso','tipo'=>'normal','peso'=>45.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente resolvio el caso en la primera llamada?','tipo'=>'si_no','peso'=>25.00,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>25.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente ofrecio alternativas si no pudo resolver?','tipo'=>'si_no','peso'=>20.00,'anula_segmento'=>false,'comentario_requerido'=>'nunca','orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>20.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v1,'nombre'=>'Cierre de Llamada','tipo'=>'normal','peso'=>30.00,'orden'=>3,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente realizo cierre ofreciendo ayuda adicional?','tipo'=>'si_no','peso'=>15.00,'anula_segmento'=>false,'comentario_requerido'=>'nunca','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>15.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente verifico la satisfaccion del cliente al cerrar?','tipo'=>'si_no','peso'=>15.00,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>15.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v1,'nombre'=>'Cumplimiento Regulatorio','tipo'=>'critico','peso'=>null,'penalizacion'=>20.00,'orden'=>4,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente divulgo el aviso de privacidad?','tipo'=>'si_no','peso'=>null,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>1.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente solicito consentimiento de grabacion?','tipo'=>'si_no','peso'=>null,'anula_segmento'=>true,'comentario_requerido'=>'si_es_no','orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>1.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v1,'nombre'=>'Observaciones Generales','tipo'=>'resumen','peso'=>null,'orden'=>5,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('preguntas')->insert(['segmento_id'=>$s,'texto'=>'Comentarios adicionales del evaluador.','tipo'=>'texto_libre','peso'=>null,'anula_segmento'=>false,'comentario_requerido'=>'nunca','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);

        // BOLETA 2: Chat Soporte Tecnico -- ACTIVA
        $b2 = DB::table('boletas')->insertGetId(['nombre'=>'Boleta Chat Soporte Tecnico','descripcion'=>'Evaluacion de calidad para interacciones de soporte tecnico via chat.','pais'=>'Mexico','cliente'=>'TechCorp SA','tipo_interaccion'=>'chat','total_global'=>100.00,'estado'=>'activa','created_by'=>$qaLeadId,'created_at'=>now(),'updated_at'=>now()]);
        $v2 = DB::table('boleta_versiones')->insertGetId(['boleta_id'=>$b2,'numero_version'=>1,'es_activa'=>true,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('boleta_version_area')->insert([['boleta_version_id'=>$v2,'area_id'=>$areaSoporte]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v2,'nombre'=>'Habilidades Comunicativas','tipo'=>'normal','peso'=>40.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'Como calificarias la comunicacion escrita del agente?','tipo'=>'opcion_multiple','peso'=>20.00,'anula_segmento'=>false,'comentario_requerido'=>'nunca','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Excelente','valor'=>20.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'Buena','valor'=>15.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'Regular','valor'=>10.00,'orden'=>3,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'Deficiente','valor'=>0.00,'orden'=>4,'created_at'=>now(),'updated_at'=>now()]]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente respondio en menos de 2 minutos por turno?','tipo'=>'si_no','peso'=>20.00,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>20.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v2,'nombre'=>'Resolucion Tecnica','tipo'=>'normal','peso'=>60.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente diagnostico correctamente el problema?','tipo'=>'si_no','peso'=>30.00,'anula_segmento'=>true,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>30.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'Que porcentaje del problema fue resuelto en el chat?','tipo'=>'porcentaje','peso'=>30.00,'anula_segmento'=>false,'comentario_requerido'=>'nunca','orden'=>2,'created_at'=>now(),'updated_at'=>now()]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v2,'nombre'=>'Uso Correcto de Herramientas','tipo'=>'critico','peso'=>null,'penalizacion'=>15.00,'orden'=>3,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente escalo el ticket dentro del CRM correctamente?','tipo'=>'si_no','peso'=>null,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>1.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        // BOLETA 3: Cobranza -- DRAFT
        $b3 = DB::table('boletas')->insertGetId(['nombre'=>'Boleta Cobranza','descripcion'=>'Evaluacion de calidad para gestiones de cobranza via llamada.','pais'=>'Costa Rica','cliente'=>'Upsorcing','tipo_interaccion'=>'llamada','total_global'=>100.00,'estado'=>'draft','created_by'=>$adminId,'created_at'=>now(),'updated_at'=>now()]);
        $v3 = DB::table('boleta_versiones')->insertGetId(['boleta_id'=>$b3,'numero_version'=>1,'es_activa'=>true,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('boleta_version_area')->insert([['boleta_version_id'=>$v3,'area_id'=>$areaAtencion]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v3,'nombre'=>'Apertura de Gestion','tipo'=>'normal','peso'=>30.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente verifico la identidad del cliente correctamente?','tipo'=>'si_no','peso'=>15.00,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>15.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente presento la deuda con claridad?','tipo'=>'si_no','peso'=>15.00,'anula_segmento'=>false,'comentario_requerido'=>'nunca','orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>15.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v3,'nombre'=>'Negociacion','tipo'=>'normal','peso'=>40.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente ofrecio alternativas de pago al cliente?','tipo'=>'si_no','peso'=>20.00,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>20.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente mantuvo un tono respetuoso durante la negociacion?','tipo'=>'si_no','peso'=>20.00,'anula_segmento'=>false,'comentario_requerido'=>'nunca','orden'=>2,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>20.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v3,'nombre'=>'Cierre de Gestion','tipo'=>'normal','peso'=>30.00,'orden'=>3,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente confirmo el compromiso de pago al final?','tipo'=>'si_no','peso'=>30.00,'anula_segmento'=>false,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>30.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $s = DB::table('segmentos')->insertGetId(['boleta_version_id'=>$v3,'nombre'=>'Cumplimiento Legal','tipo'=>'critico','peso'=>null,'penalizacion'=>25.00,'orden'=>4,'created_at'=>now(),'updated_at'=>now()]);
        $p = DB::table('preguntas')->insertGetId(['segmento_id'=>$s,'texto'=>'El agente evito amenazas o presion ilegal al cliente?','tipo'=>'si_no','peso'=>null,'anula_segmento'=>true,'comentario_requerido'=>'si_es_no','orden'=>1,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('pregunta_opciones')->insert([['pregunta_id'=>$p,'texto'=>'Si','valor'=>1.00,'orden'=>1,'created_at'=>now(),'updated_at'=>now()],['pregunta_id'=>$p,'texto'=>'No','valor'=>0.00,'orden'=>2,'created_at'=>now(),'updated_at'=>now()]]);

        $this->command->info('BoletaSeeder: 3 boletas creadas (2 activas + 1 draft) con opciones completas.');
    }
}
