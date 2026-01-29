<?php

namespace App\Http\Controllers;

use App\Events\ReportStatusChanged;
use App\Models\Category;
use App\Models\Photo;
use App\Models\Report;
use App\Services\DuplicateDetectionService;
use App\Services\ExifService;
use App\Services\SpatialTriagingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    protected SpatialTriagingService $spatialService;
    protected DuplicateDetectionService $duplicateService;
    protected ExifService $exifService;

    public function __construct(
        SpatialTriagingService $spatialService,
        DuplicateDetectionService $duplicateService,
        ExifService $exifService
    ) {
        $this->spatialService = $spatialService;
        $this->duplicateService = $duplicateService;
        $this->exifService = $exifService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Report::with(['user', 'category', 'authority', 'photos']);

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->latest()->paginate(20);

        return Inertia::render('Reports/Index', [
            'reports' => $reports,
            'categories' => Category::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Reports/Create', [
            'categories' => Category::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'category_id' => 'required|exists:categories,id',
            'photos' => 'nullable|array|max:5',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:5120', // 5MB max
        ]);

        // Find nearby duplicate reports
        $nearbyReports = $this->duplicateService->findNearbyReports(
            $validated['lat'],
            $validated['lng']
        );

        if ($nearbyReports->isNotEmpty()) {
            return response()->json([
                'message' => 'Nearby reports found. Please check if your issue is already reported.',
                'nearby_reports' => $nearbyReports,
            ], 409);
        }

        // Determine authority using spatial triaging
        $authority = $this->spatialService->findAuthorityForPoint(
            $validated['lat'],
            $validated['lng']
        );

        // Create the report
        $report = Report::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'lat' => $validated['lat'],
            'lng' => $validated['lng'],
            'category_id' => $validated['category_id'],
            'user_id' => $request->user()->id,
            'authority_id' => $authority?->id,
            'status' => 'open',
        ]);

        // Handle photo uploads
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('reports', 'public');
                
                Photo::create([
                    'report_id' => $report->id,
                    'path' => $path,
                ]);
            }
        }

        return redirect()->route('reports.show', $report)
            ->with('success', 'Report created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report): Response
    {
        $report->load(['user', 'category', 'authority', 'photos', 'comments.user']);

        return Inertia::render('Reports/Show', [
            'report' => $report,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Report $report)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:open,in-progress,fixed,closed',
        ]);

        if (isset($validated['status']) && $validated['status'] !== $report->status) {
            $oldStatus = $report->status;
            $report->update(['status' => $validated['status']]);

            // Fire status change event
            event(new ReportStatusChanged($report, $oldStatus, $validated['status']));

            return back()->with('success', 'Report status updated successfully!');
        }

        return back();
    }

    /**
     * Extract GPS coordinates from uploaded photo.
     */
    public function extractGps(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg',
        ]);

        $coordinates = $this->exifService->extractGpsCoordinates($request->file('photo'));

        if ($coordinates) {
            return response()->json([
                'success' => true,
                'coordinates' => $coordinates,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No GPS data found in the image.',
        ], 422);
    }

    /**
     * Check for duplicate reports near a location.
     */
    public function checkDuplicates(Request $request)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $nearbyReports = $this->duplicateService->findNearbyReports(
            $validated['lat'],
            $validated['lng']
        );

        return response()->json([
            'count' => $nearbyReports->count(),
            'reports' => $nearbyReports,
        ]);
    }
}
