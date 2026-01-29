<?php

namespace App\Events;

use App\Models\Report;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Report $report;
    public string $oldStatus;
    public string $newStatus;

    /**
     * Create a new event instance.
     */
    public function __construct(Report $report, string $oldStatus, string $newStatus)
    {
        $this->report = $report;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }
}
