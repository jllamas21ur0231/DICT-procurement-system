<?php

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Http\Middleware\EnsureActiveSAdminSession;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        $middleware->alias([
            'active.device' => EnsureActiveDeviceSession::class,
            'active.sadmin' => EnsureActiveSAdminSession::class,
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
            'sadmin/accounts',
            'sadmin/accounts/*',
            'sadmin/data',
            'sadmin/data/*',
            'admin/accounts',
            'admin/accounts/*',
            'admin/projects',
            'admin/projects/*',
            'admin/procurement-modes',
            'admin/procurement-modes/*',
            'sadmin/request-otp',
            'sadmin/verify-otp',
            'sadmin/resend-otp',
            'sadmin/logout',
        ]);


    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (
                $request->expectsJson()
                || $request->is('auth/*')
                || $request->is('sadmin/*')
                || $request->is('procurements*')
                || $request->is('purchase-requests*')
                || $request->is('notifications*')
                || $request->is('reports*')
                || $request->is('admin/*')
                || $request->is('super-admin/*')
            ) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            return null;
        });
    })->create();
