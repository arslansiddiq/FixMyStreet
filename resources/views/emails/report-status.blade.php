<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Report Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin: 5px;
        }
        .status-open { background-color: #FEF3C7; color: #92400E; }
        .status-in-progress { background-color: #DBEAFE; color: #1E40AF; }
        .status-fixed { background-color: #D1FAE5; color: #065F46; }
        .status-closed { background-color: #F3F4F6; color: #374151; }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6B7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Report Status Updated</h1>
        </div>
        <div class="content">
            <h2>Hello {{ $report->user->name }},</h2>
            
            <p>Your report <strong>"{{ $report->title }}"</strong> has been updated.</p>
            
            <p>
                <strong>Status changed from:</strong>
                <span class="status-badge status-{{ $oldStatus }}">{{ ucfirst($oldStatus) }}</span>
                to
                <span class="status-badge status-{{ $newStatus }}">{{ ucfirst($newStatus) }}</span>
            </p>
            
            <h3>Report Details:</h3>
            <ul>
                <li><strong>Title:</strong> {{ $report->title }}</li>
                <li><strong>Category:</strong> {{ $report->category->name }}</li>
                <li><strong>Location:</strong> {{ $report->lat }}, {{ $report->lng }}</li>
                @if($report->authority)
                    <li><strong>Authority:</strong> {{ $report->authority->name }}</li>
                @endif
            </ul>
            
            <p>
                <a href="{{ url('/reports/' . $report->id) }}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                    View Report Details
                </a>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated message from StreetFixer. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
