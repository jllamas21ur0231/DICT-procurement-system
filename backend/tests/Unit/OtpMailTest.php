<?php

namespace Tests\Unit;

use App\Mail\OtpMail;
use PHPUnit\Framework\TestCase;

class OtpMailTest extends TestCase
{
    public function test_it_renders_the_otp_template_inline_with_expected_data(): void
    {
        $mail = new OtpMail(
            otp: '123456',
            name: 'Test User',
            expiresInMinutes: 5,
        );

        $content = $mail->content();

        $this->assertNull($content->view);
        $this->assertSame('123456', $mail->otp);
        $this->assertStringContainsString('123456', $content->htmlString);
        $this->assertStringContainsString('Verification Code', $content->htmlString);
        $this->assertStringContainsString('5 minutes', $content->htmlString);
    }
}
