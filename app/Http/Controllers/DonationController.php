<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Report;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    /**
     * Store a newly created donation.
     */
    public function store(Request $request, Report $report)
    {
        // Check if user has permission to donate
        if (!$request->user()->can('donate-to-task')) {
            abort(403, 'You do not have permission to donate.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'message' => 'nullable|string|max:500',
        ]);

        $donation = Donation::create([
            'report_id' => $report->id,
            'user_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'message' => $validated['message'] ?? null,
        ]);

        return back()->with('success', 'Thank you for your donation!');
    }
}
