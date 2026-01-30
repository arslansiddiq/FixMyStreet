<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\DonationController;
use App\Models\Category;
use App\Models\Report;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $reports = Report::with(['user', 'category', 'authority', 'photos'])
        ->latest()
        ->limit(100) // Limit to 100 most recent reports for performance
        ->get();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'reports' => $reports,
        'categories' => Category::all(),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Report routes
    Route::resource('reports', ReportController::class);
    Route::post('/reports/extract-gps', [ReportController::class, 'extractGps'])->name('reports.extract-gps');
    Route::post('/reports/check-duplicates', [ReportController::class, 'checkDuplicates'])->name('reports.check-duplicates');
    
    // Bid routes
    Route::post('/reports/{report}/bids', [BidController::class, 'store'])->name('bids.store');
    Route::patch('/bids/{bid}/accept', [BidController::class, 'accept'])->name('bids.accept');
    Route::patch('/bids/{bid}/complete', [BidController::class, 'complete'])->name('bids.complete');
    
    // Donation routes
    Route::post('/reports/{report}/donations', [DonationController::class, 'store'])->name('donations.store');
});

require __DIR__.'/auth.php';
