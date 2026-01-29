import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

interface Category {
    id: number;
    name: string;
}

interface Props extends PageProps {
    categories: Category[];
}

export default function Create({ auth, categories }: Props) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        lat: 37.7749,
        lng: -122.4194,
        category_id: '',
        photos: [] as File[],
    });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('photos', Array.from(e.target.files));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('reports.store'), {
            forceFormData: true,
        });
    };

    const nextStep = () => setStep(Math.min(step + 1, 4));
    const prevStep = () => setStep(Math.max(step - 1, 1));

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Report</h2>}
        >
            <Head title="Create Report" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Stepper */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between">
                                    {[1, 2, 3, 4].map((s) => (
                                        <div key={s} className="flex flex-1 items-center">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                    s <= step
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-300 text-gray-600'
                                                }`}
                                            >
                                                {s}
                                            </div>
                                            {s < 4 && (
                                                <div
                                                    className={`h-1 flex-1 ${
                                                        s < step ? 'bg-indigo-600' : 'bg-gray-300'
                                                    }`}
                                                ></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span>Location</span>
                                    <span>Photo</span>
                                    <span>Details</span>
                                    <span>Confirm</span>
                                </div>
                            </div>

                            <form onSubmit={submit}>
                                {/* Step 1: Map/Location */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Select Location</h3>
                                        <p className="text-sm text-gray-600">
                                            Click on the map or enter coordinates manually.
                                        </p>
                                        
                                        {/* Placeholder for map - would integrate Leaflet here */}
                                        <div className="h-96 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                                            <p className="text-gray-500">Map Component - Leaflet integration point</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="lat" value="Latitude" />
                                                <TextInput
                                                    id="lat"
                                                    type="number"
                                                    step="any"
                                                    value={data.lat}
                                                    onChange={(e) => setData('lat', parseFloat(e.target.value))}
                                                    className="mt-1 block w-full"
                                                />
                                                <InputError message={errors.lat} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="lng" value="Longitude" />
                                                <TextInput
                                                    id="lng"
                                                    type="number"
                                                    step="any"
                                                    value={data.lng}
                                                    onChange={(e) => setData('lng', parseFloat(e.target.value))}
                                                    className="mt-1 block w-full"
                                                />
                                                <InputError message={errors.lng} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Photo Upload */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Upload Photos</h3>
                                        <p className="text-sm text-gray-600">
                                            Upload photos of the issue (optional, max 5).
                                        </p>

                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handlePhotoUpload}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-md file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-indigo-50 file:text-indigo-700
                                                    hover:file:bg-indigo-100"
                                            />
                                            <InputError message={errors.photos} className="mt-2" />
                                        </div>

                                        {data.photos.length > 0 && (
                                            <div className="grid grid-cols-3 gap-4">
                                                {data.photos.map((photo, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={URL.createObjectURL(photo)}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-32 w-full rounded-lg object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 3: Details */}
                                {step === 3 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Report Details</h3>

                                        <div>
                                            <InputLabel htmlFor="title" value="Title" />
                                            <TextInput
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Brief description of the issue"
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="category_id" value="Category" />
                                            <select
                                                id="category_id"
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.category_id} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="description" value="Description" />
                                            <textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                rows={4}
                                                placeholder="Detailed description of the issue"
                                            />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Confirm */}
                                {step === 4 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Review & Submit</h3>

                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <dl className="space-y-2">
                                                <div>
                                                    <dt className="font-medium text-gray-700">Title:</dt>
                                                    <dd className="text-gray-900">{data.title}</dd>
                                                </div>
                                                <div>
                                                    <dt className="font-medium text-gray-700">Category:</dt>
                                                    <dd className="text-gray-900">
                                                        {categories.find((c) => c.id === Number(data.category_id))?.name ||
                                                            'Not selected'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="font-medium text-gray-700">Description:</dt>
                                                    <dd className="text-gray-900">{data.description}</dd>
                                                </div>
                                                <div>
                                                    <dt className="font-medium text-gray-700">Location:</dt>
                                                    <dd className="text-gray-900">
                                                        {data.lat.toFixed(6)}, {data.lng.toFixed(6)}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="font-medium text-gray-700">Photos:</dt>
                                                    <dd className="text-gray-900">{data.photos.length} uploaded</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="mt-6 flex justify-between">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {step < 4 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <PrimaryButton className="ml-auto" disabled={processing}>
                                            Submit Report
                                        </PrimaryButton>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
