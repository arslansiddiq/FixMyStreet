import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack/vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

interface Props {
    reports: Report[];
    selectedReport?: Report | null;
    onReportClick?: (report: Report) => void;
}

export default function ReportsMap({ reports, selectedReport, onReportClick }: Props) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Initialize map centered on default location (San Francisco)
        const map = L.map(mapContainerRef.current).setView([37.7749, -122.4194], 12);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        if (reports.length === 0) return;

        // Create bounds to fit all markers
        const bounds = L.latLngBounds([]);

        // Add markers for each report
        reports.forEach(report => {
            const marker = L.marker([report.lat, report.lng]);
            
            // Create popup content
            const statusColor = {
                'open': '#FEF3C7',
                'in-progress': '#DBEAFE',
                'fixed': '#D1FAE5',
                'closed': '#F3F4F6'
            }[report.status] || '#F3F4F6';

            const popupContent = `
                <div style="min-width: 200px;">
                    <h3 style="font-weight: bold; font-size: 1.1em; margin-bottom: 8px; color: #1F2937;">
                        ${report.title}
                    </h3>
                    <p style="margin-bottom: 8px; color: #4B5563; font-size: 0.9em;">
                        ${report.description.length > 100 ? report.description.substring(0, 100) + '...' : report.description}
                    </p>
                    <div style="margin-bottom: 6px;">
                        <span style="background-color: ${statusColor}; padding: 4px 8px; border-radius: 9999px; font-size: 0.75em; font-weight: 600;">
                            ${report.status.toUpperCase()}
                        </span>
                    </div>
                    <div style="font-size: 0.85em; color: #6B7280; margin-bottom: 4px;">
                        <strong>Category:</strong> ${report.category.name}
                    </div>
                    <div style="font-size: 0.85em; color: #6B7280; margin-bottom: 4px;">
                        <strong>Reported by:</strong> ${report.user.name}
                    </div>
                    ${report.authority ? `
                        <div style="font-size: 0.85em; color: #6B7280; margin-bottom: 8px;">
                            <strong>Authority:</strong> ${report.authority.name}
                        </div>
                    ` : ''}
                    ${report.photos.length > 0 ? `
                        <div style="margin-top: 8px;">
                            <img src="/storage/${report.photos[0].path}" style="width: 100%; border-radius: 4px; max-height: 150px; object-fit: cover;" />
                        </div>
                    ` : ''}
                </div>
            `;

            marker.bindPopup(popupContent);
            
            if (onReportClick) {
                marker.on('click', () => onReportClick(report));
            }

            marker.addTo(mapRef.current!);
            markersRef.current.push(marker);
            bounds.extend([report.lat, report.lng]);
        });

        // Fit map to show all markers
        if (reports.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [reports, onReportClick]);

    useEffect(() => {
        if (!mapRef.current || !selectedReport) return;

        // Pan to selected report
        mapRef.current.setView([selectedReport.lat, selectedReport.lng], 15);

        // Find and open the popup for the selected report
        const selectedMarker = markersRef.current.find(marker => {
            const latlng = marker.getLatLng();
            return latlng.lat === selectedReport.lat && latlng.lng === selectedReport.lng;
        });

        if (selectedMarker) {
            selectedMarker.openPopup();
        }
    }, [selectedReport]);

    return (
        <div 
            ref={mapContainerRef} 
            style={{ height: '600px', width: '100%', borderRadius: '8px' }}
        />
    );
}
