<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $subjectLine,
        public readonly string $messageBody,
        public readonly string $recipientName = 'User',
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->renderHtml(),
        );
    }

    private function renderHtml(): string
    {
        $subject = e($this->subjectLine);
        $recipient = e($this->recipientName);
        $message = nl2br(e($this->messageBody));

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{$subject}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Segoe UI', Arial, sans-serif; color: #1f2933; }
        .wrapper { width: 100%; padding: 32px 16px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #d9e2ec; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
        .header { background: linear-gradient(135deg, #1a6683 0%, #0f4a61 100%); color: #ffffff; padding: 28px 32px; }
        .header-title { margin: 0; font-size: 24px; font-weight: 700; }
        .header-subtitle { margin: 8px 0 0; font-size: 13px; opacity: 0.85; }
        .body { padding: 32px; line-height: 1.7; font-size: 14px; }
        .message-box { margin-top: 20px; padding: 18px 20px; background: #f8fbfc; border-left: 4px solid #1a6683; border-radius: 8px; }
        .footer { padding: 20px 32px 28px; font-size: 12px; color: #7b8794; border-top: 1px solid #e6edf3; background: #fbfcfd; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="card">
        <div class="header">
            <h1 class="header-title">{$subject}</h1>
            <p class="header-subtitle">DICT Procurement System Email Test</p>
        </div>
        <div class="body">
            <p>Hello {$recipient},</p>
            <div class="message-box">{$message}</div>
        </div>
        <div class="footer">
            This is an automated message from the DICT Procurement System.
        </div>
    </div>
</div>
</body>
</html>
HTML;
    }
}
