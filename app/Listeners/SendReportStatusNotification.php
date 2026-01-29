<?php

namespace App\Listeners;

use App\Events\ReportStatusChanged;
use App\Mail\ReportStatusNotification;
use Illuminate\Support\Facades\Mail;

class SendReportStatusNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ReportStatusChanged $event): void
    {
        // Send email notification to the user who created the report
        Mail::to($event->report->user->email)
            ->send(new ReportStatusNotification($event->report, $event->oldStatus, $event->newStatus));
    }
}
