<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddSecurityHeaders
{
    /**
     * Handle an incoming request and add security headers to the response.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Content Security Policy - Previene XSS
        // Permite scripts solo del mismo origen y inline (necesario para Angular)
        $response->headers->set('Content-Security-Policy', 
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
            "style-src 'self' 'unsafe-inline'; " .
            "img-src 'self' data: https:; " .
            "font-src 'self' data:; " .
            "connect-src 'self' http://localhost:4200 http://localhost:8000;"
        );

        // Previene MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Previene clickjacking (no permitir iframes de otros dominios)
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Protección XSS adicional para navegadores antiguos
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Controla qué información se envía en el header Referer
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Fuerza HTTPS en producción (comentado para desarrollo local)
        // $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        return $response;
    }
}
