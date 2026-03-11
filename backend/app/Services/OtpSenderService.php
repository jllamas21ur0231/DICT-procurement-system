<?php

namespace App\Services;

use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;

class OtpSenderService
{
    public function send(string $email, string $name, string $otp, int $expiresInMinutes): void
    {
        Mail::to($email)->send(new OtpMail(
            otp: $otp,
            name: trim($name) !== '' ? $name : 'User',
            expiresInMinutes: $expiresInMinutes,
        ));
    }
}
