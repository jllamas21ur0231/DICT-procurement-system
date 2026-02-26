<?php

use App\Http\Middleware\EnsureActiveDeviceSession;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        $middleware->alias([
            'active.device' => EnsureActiveDeviceSession::class,
        ]);

        
        $middleware->validateCsrfTokens(except: [
            'auth/request-otp',
            'auth/verify-otp',
            'auth/resend-otp',
            'auth/logout',
            'procurements',
            'procurements/*',
            'purchase-requests',
            'purchase-requests/*',
            'items',
            'items/*',
            'notifications',
            'notifications/*',
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
