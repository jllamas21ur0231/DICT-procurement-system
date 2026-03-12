<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>{{ $subjectLine }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f7f9;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1f2933;
        }

        .wrapper {
            width: 100%;
            padding: 32px 16px;
        }

        .card {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #d9e2ec;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .header {
            background: linear-gradient(135deg, #1a6683 0%, #0f4a61 100%);
            color: #ffffff;
            padding: 28px 32px;
        }

        .header-title {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }

        .header-subtitle {
            margin: 8px 0 0;
            font-size: 13px;
            opacity: 0.85;
        }

        .body {
            padding: 32px;
            line-height: 1.7;
            font-size: 14px;
        }

        .message-box {
            margin: 20px 0 0;
            padding: 18px 20px;
            background: #f8fbfc;
            border-left: 4px solid #1a6683;
            border-radius: 8px;
            white-space: pre-line;
        }

        .footer {
            padding: 20px 32px 28px;
            font-size: 12px;
            color: #7b8794;
            border-top: 1px solid #e6edf3;
            background: #fbfcfd;
        }

        @media only screen and (max-width: 600px) {
            .header,
            .body,
            .footer {
                padding-left: 20px;
                padding-right: 20px;
            }
        }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="card">
        <div class="header">
            <h1 class="header-title">{{ $subjectLine }}</h1>
            <p class="header-subtitle">DICT Procurement System Email Test</p>
        </div>

        <div class="body">
            <p>Hello {{ $recipientName }},</p>

            <div class="message-box">{{ $messageBody }}</div>
        </div>

        <div class="footer">
            This is an automated message from the DICT Procurement System.
        </div>
    </div>
</div>
</body>
</html>
