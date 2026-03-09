<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Your DICT OTP Code</title>
    <style>
        /* ── Reset ── */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; }

        /* ── Base ── */
        body {
            background-color: #f0f4f7;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 15px;
            color: #333333;
            margin: 0;
            padding: 0;
        }

        /* ── Wrapper ── */
        .email-wrapper {
            width: 100%;
            background-color: #f0f4f7;
            padding: 40px 16px;
        }

        /* ── Card ── */
        .email-card {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(26, 102, 131, 0.10);
        }

        /* ── Header ── */
        .email-header {
            background: linear-gradient(135deg, #1A6683 0%, #0f4a61 100%);
            padding: 36px 40px 32px;
            text-align: center;
        }
        .email-header .logo-wrap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 18px;
        }
        .email-header .logo-img {
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.15);
            border-radius: 12px;
            display: inline-block;
            line-height: 48px;
            text-align: center;
        }
        .email-header .logo-img img {
            width: 36px;
            height: 36px;
            vertical-align: middle;
        }
        .email-header .org-name {
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .email-header .org-sub {
            color: rgba(255,255,255,0.75);
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .header-title {
            color: #ffffff;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.3px;
        }
        .header-subtitle {
            color: rgba(255,255,255,0.80);
            font-size: 14px;
            margin-top: 6px;
        }

        /* ── Body ── */
        .email-body {
            padding: 40px 40px 32px;
        }
        .greeting {
            font-size: 16px;
            color: #333333;
            margin-bottom: 12px;
        }
        .message-text {
            font-size: 14px;
            line-height: 1.7;
            color: #555555;
            margin-bottom: 32px;
        }

        /* ── OTP Box ── */
        .otp-container {
            text-align: center;
            margin-bottom: 32px;
        }
        .otp-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #1A6683;
            margin-bottom: 14px;
        }
        .otp-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0;
        }
        .otp-code {
            display: inline-block;
            background: linear-gradient(135deg, #f0f8fb 0%, #e2f3f8 100%);
            border: 2px solid #1A6683;
            border-radius: 12px;
            padding: 18px 40px;
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 14px;
            color: #1A6683;
            font-family: 'Courier New', 'Lucida Console', monospace;
            text-indent: 14px; /* compensate letter-spacing on last char */
        }
        .otp-expiry {
            margin-top: 12px;
            font-size: 12px;
            color: #888888;
        }
        .otp-expiry strong {
            color: #c0392b;
        }

        /* ── Divider ── */
        .divider {
            border: none;
            border-top: 1px solid #edf2f5;
            margin: 0 0 24px;
        }

        /* ── Security Note ── */
        .security-note {
            background: #fff8e1;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 14px 18px;
            font-size: 13px;
            color: #7a5c00;
            line-height: 1.6;
            margin-bottom: 28px;
        }
        .security-note strong {
            color: #5c4200;
        }

        /* ── Footer ── */
        .email-footer {
            background: #f7fafc;
            border-top: 1px solid #e8edf0;
            padding: 24px 40px;
            text-align: center;
        }
        .footer-text {
            font-size: 12px;
            color: #999999;
            line-height: 1.7;
        }
        .footer-brand {
            color: #1A6683;
            font-weight: 600;
            text-decoration: none;
        }
        .footer-divider {
            display: inline-block;
            margin: 0 8px;
            color: #cccccc;
        }

        /* ── Responsive ── */
        @media only screen and (max-width: 600px) {
            .email-header, .email-body, .email-footer { padding-left: 24px !important; padding-right: 24px !important; }
            .otp-code { font-size: 32px !important; letter-spacing: 8px !important; padding: 14px 24px !important; }
        }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="email-card">

        {{-- ── Header ── --}}
        <div class="email-header">
            <div class="logo-wrap">
                <div style="text-align:left;">
                    <div class="org-name">DICT Procurement System</div>
                </div>
            </div>
            <div class="header-title">Verification Code</div>
            <div class="header-subtitle">Secure your account with this one-time passcode</div>
        </div>

        {{-- ── Body ── --}}
        <div class="email-body">

            <p class="message-text">
                A login request has been initiated using this email address to access the
                <strong>Department of Information and Communications Technology (DICT)</strong> system.
                To proceed with signing in, please verify your email by entering the One-Time Password (OTP)
                provided below on the verification page.
            </p>

            {{-- OTP Display --}}
            <div class="otp-container">
                <div class="otp-label">Verification Code</div>
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-expiry">
                    This OTP is valid for <strong>{{ $expiresInMinutes ?? 10 }} minutes</strong>
                    and can only be used for this login session.
                </div>
            </div>

            <hr class="divider" />

            {{-- Security Notice --}}
            <div class="security-note">
                🔒 <strong>For security purposes, please do not share this code with anyone.</strong>
            </div>

            <p class="message-text" style="margin-bottom: 0;">
                If you did not attempt to sign in to the DICT system, you may safely ignore this message.
                No changes will be made to your account without successful verification.
            </p>

        </div>

        {{-- ── Footer ── --}}
        <div class="email-footer">
            <p class="footer-text">
                <span class="footer-brand">Department of Information and Communications Technology (DICT)</span>
            </p>
            <p class="footer-text" style="margin-top:8px;">
                This is an automated message. Please do not reply to this email.
            </p>
            <p class="footer-text" style="margin-top:10px; color:#bbbbbb;">
                &copy; {{ date('Y') }} DICT. All rights reserved.
            </p>
        </div>

    </div>
</div>
</body>
</html>
