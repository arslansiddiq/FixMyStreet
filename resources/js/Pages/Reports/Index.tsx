import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { useState } from 'react';

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

interface Props extends PageProps {
    reports: {
        data: Report[];
        links: any;
        meta: any;
    };
    categories: Category[];
}

export default function Index({ auth, reports, categories }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

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
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Reports</h2>}
        >
            <Head title="Reports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Header with Create Button */}
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium">All Reports</h3>
                                <Link
                                    href={route('reports.create')}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                >
                                    Create Report
                                </Link>
                            </div>

                            {/* Filters */}
                            <div className="mb-6 flex gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        value={selectedCategory || ''}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value ? Number(e.target.value) : null)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={selectedStatus || ''}
                                        onChange={(e) => setSelectedStatus(e.target.value || null)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="fixed">Fixed</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reports List */}
                            <div className="space-y-4">
                                {reports.data.map((report) => (
                                    <div
                                        key={report.id}
                                        className="rounded-lg border border-gray-200 p-4 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <Link
                                                    href={route('reports.show', report.id)}
                                                    className="text-lg font-medium text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {report.title}
                                                </Link>
                                                <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Category: {report.category.name}</span>
                                                    <span>By: {report.user.name}</span>
                                                    {report.authority && <span>Authority: {report.authority.name}</span>}
                                                </div>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                                                    report.status,
                                                )}`}
                                            >
                                                {report.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {reports.data.length === 0 && (
                                <div className="py-8 text-center text-gray-500">
                                    No reports found. Create your first report!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
