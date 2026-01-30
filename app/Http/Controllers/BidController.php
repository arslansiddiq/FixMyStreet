<?php

namespace App\Http\Controllers;

use App\Models\Bid;
use App\Models\Report;
use Illuminate\Http\Request;

class BidController extends Controller
{
    /**
     * Store a newly created bid.
     */
    public function store(Request $request, Report $report)
    {
        // Check if user has permission to bid on reports
        if (!$request->user()->can('bid-on-report')) {
            abort(403, 'You do not have permission to bid on reports.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
        ]);

        $bid = Bid::create([
            'report_id' => $report->id,
            'user_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Bid submitted successfully!');
    }

    /**
     * Accept a bid and assign the task.
     */
    public function accept(Bid $bid)
    {
        // Check if user has permission to approve reports
        if (!auth()->user()->can('approve-report')) {
            abort(403, 'You do not have permission to accept bids.');
        }

        // Get the report
        $report = $bid->report;

        // Check if there are enough donations to cover the bid
        $totalDonations = $report->donations()->sum('amount');
        
        if ($totalDonations < $bid->amount) {
            return back()->with('error', 'Insufficient donations to accept this bid.');
        }

        // Update the bid status
        $bid->update(['status' => 'accepted']);

        // Update other bids to rejected
        Bid::where('report_id', $report->id)
            ->where('id', '!=', $bid->id)
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);

        // Update report status and assign the bid
        $report->update([
            'status' => 'in-progress',
            'assigned_bid_id' => $bid->id,
        ]);

        return back()->with('success', 'Bid accepted and task assigned!');
    }

    /**
     * Mark a bid as completed.
     */
    public function complete(Bid $bid)
    {
        // Check if user has permission to approve reports
        if (!auth()->user()->can('approve-report')) {
            abort(403, 'You do not have permission to complete bids.');
        }

        $bid->update(['status' => 'completed']);
        $bid->report->update(['status' => 'fixed']);

        return back()->with('success', 'Task marked as completed!');
    }
}
