import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import ReportsMap from '@/Components/ReportsMap';

interface Report {
    id: number;
    title: string;
    description: string;
    lat: number;
    lng: number;
    status: 'open' | 'in-progress' | 'fixed' | 'closed';
    category: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
    authority?: {
        id: number;
        name: string;
    };
    photos: Array<{
        id: number;
        path: string;
    }>;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
}

export default function Welcome({
    auth,
    reports = [],
    categories = [],
}: PageProps<{ reports: Report[]; categories: Category[] }>) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchArea, setSearchArea] = useState<string>('');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const filteredReports = useMemo(() => {
        let filtered = reports;

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(report => report.category.id === selectedCategory);
        }

        // Filter by area (search in title, description, authority name)
        if (searchArea.trim()) {
            const searchLower = searchArea.toLowerCase();
            filtered = filtered.filter(report => 
                report.title.toLowerCase().includes(searchLower) ||
                report.description.toLowerCase().includes(searchLower) ||
                report.authority?.name.toLowerCase().includes(searchLower) ||
                report.category.name.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [reports, selectedCategory, searchArea]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-yellow-100 text-yellow-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'fixed':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head title="StreetFixer - Report Local Issues" />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold text-indigo-600">StreetFixer</h1>
                                <p className="ml-4 text-sm text-gray-600 hidden sm:block">
                                    Report and track local infrastructure issues
                                </p>
                            </div>
                            <nav className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Local Infrastructure Reports
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">
                            View and search reported issues in your area
                        </p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search by Area or Keyword
                                </label>
                                <input
                                    type="text"
                                    value={searchArea}
                                    onChange={(e) => setSearchArea(e.target.value)}
                                    placeholder="Search reports..."
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Category
                                </label>
                                <select
                                    value={selectedCategory || ''}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value ? Number(e.target.value) : null)
                                    }
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <div className="w-full">
                                    <p className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{filteredReports.length}</span> of{' '}
                                        <span className="font-semibold">{reports.length}</span> reports
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Reports Map</h3>
                        <ReportsMap
                            reports={filteredReports}
                            selectedReport={selectedReport}
                            onReportClick={(report) => setSelectedReport(report)}
                        />
                    </div>

                    {/* Reports List */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Reports</h3>
                        {filteredReports.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-gray-500">No reports found matching your search.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredReports.slice(0, 9).map((report) => (
                                    <div
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className="cursor-pointer rounded-lg border border-gray-200 p-4 transition hover:shadow-lg hover:border-indigo-300"
                                    >
                                        {report.photos.length > 0 && (
                                            <img
                                                src={`/storage/${report.photos[0].path}`}
                                                alt={report.title}
                                                className="mb-3 h-40 w-full rounded-md object-cover"
                                            />
                                        )}
                                        <h4 className="font-semibold text-gray-900">{report.title}</h4>
                                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                            {report.description}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xs text-gray-500">{report.category.name}</span>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                                                    report.status,
                                                )}`}
                                            >
                                                {report.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {filteredReports.length > 9 && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500">
                                    Showing 9 of {filteredReports.length} reports
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Call to Action */}
                    {!auth.user && (
                        <div className="mt-8 rounded-lg bg-indigo-50 p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Want to report an issue?
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Create an account to report and track infrastructure issues in your area.
                            </p>
                            <div className="mt-6 flex justify-center gap-4">
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="rounded-md bg-white px-6 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 border border-indigo-600"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-12 border-t border-gray-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-500">
                            &copy; 2026 StreetFixer. Report local infrastructure issues to your authorities.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
