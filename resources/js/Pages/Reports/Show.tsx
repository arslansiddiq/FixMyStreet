import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

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
        email: string;
    };
    authority?: {
        id: number;
        name: string;
        email: string;
    };
    photos: Array<{
        id: number;
        path: string;
    }>;
    comments: Array<{
        id: number;
        body: string;
        is_official: boolean;
        user: {
            id: number;
            name: string;
        };
        created_at: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    report: Report;
}

export default function Show({ auth, report }: Props) {
    const { data, setData, patch, processing } = useForm({
        status: report.status,
    });

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

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('status', e.target.value as any);
        patch(route('reports.update', report.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Report Details</h2>
                    <Link
                        href={route('reports.index')}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                        ← Back to Reports
                    </Link>
                </div>
            }
        >
            <Head title={report.title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Header */}
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold">{report.title}</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Reported by {report.user.name} on{' '}
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
                                        report.status,
                                    )}`}
                                >
                                    {report.status.replace('-', ' ').toUpperCase()}
                                </span>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Details */}
                                    <div>
                                        <h4 className="mb-2 font-medium text-gray-700">Description</h4>
                                        <p className="text-gray-900">{report.description}</p>
                                    </div>

                                    {/* Category & Authority */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="mb-1 font-medium text-gray-700">Category</h4>
                                            <p className="text-gray-900">{report.category.name}</p>
                                        </div>
                                        {report.authority && (
                                            <div>
                                                <h4 className="mb-1 font-medium text-gray-700">Authority</h4>
                                                <p className="text-gray-900">{report.authority.name}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <h4 className="mb-2 font-medium text-gray-700">Location</h4>
                                        <p className="text-gray-900">
                                            Latitude: {report.lat}
                                            <br />
                                            Longitude: {report.lng}
                                        </p>
                                        {/* Placeholder for embedded map */}
                                        <div className="mt-2 h-48 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center">
                                            <p className="text-gray-500">Map View</p>
                                        </div>
                                    </div>

                                    {/* Status Update (Admin only) */}
                                    <div>
                                        <h4 className="mb-2 font-medium text-gray-700">Update Status</h4>
                                        <select
                                            value={data.status}
                                            onChange={handleStatusChange}
                                            disabled={processing}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="fixed">Fixed</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Photos */}
                                    {report.photos.length > 0 && (
                                        <div>
                                            <h4 className="mb-2 font-medium text-gray-700">Photos</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {report.photos.map((photo) => (
                                                    <img
                                                        key={photo.id}
                                                        src={`/storage/${photo.path}`}
                                                        alt="Report"
                                                        className="h-32 w-full rounded-lg object-cover"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Comments */}
                                    <div>
                                        <h4 className="mb-2 font-medium text-gray-700">Comments</h4>
                                        {report.comments.length > 0 ? (
                                            <div className="space-y-3">
                                                {report.comments.map((comment) => (
                                                    <div
                                                        key={comment.id}
                                                        className={`rounded-lg p-3 ${
                                                            comment.is_official
                                                                ? 'bg-indigo-50 border border-indigo-200'
                                                                : 'bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {comment.user.name}
                                                                {comment.is_official && (
                                                                    <span className="ml-2 text-xs text-indigo-600">
                                                                        (Official)
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(comment.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-700">{comment.body}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No comments yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
