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
            
            // Create popup content safely using DOM manipulation
            const popupDiv = document.createElement('div');
            popupDiv.style.minWidth = '200px';
            
            const title = document.createElement('h3');
            title.style.fontWeight = 'bold';
            title.style.fontSize = '1.1em';
            title.style.marginBottom = '8px';
            title.style.color = '#1F2937';
            title.textContent = report.title;
            popupDiv.appendChild(title);
            
            const description = document.createElement('p');
            description.style.marginBottom = '8px';
            description.style.color = '#4B5563';
            description.style.fontSize = '0.9em';
            const descText = report.description.length > 100 
                ? report.description.substring(0, 100) + '...' 
                : report.description;
            description.textContent = descText;
            popupDiv.appendChild(description);
            
            const statusColor = {
                'open': '#FEF3C7',
                'in-progress': '#DBEAFE',
                'fixed': '#D1FAE5',
                'closed': '#F3F4F6'
            }[report.status] || '#F3F4F6';
            
            const statusBadge = document.createElement('div');
            statusBadge.style.marginBottom = '6px';
            const statusSpan = document.createElement('span');
            statusSpan.style.backgroundColor = statusColor;
            statusSpan.style.padding = '4px 8px';
            statusSpan.style.borderRadius = '9999px';
            statusSpan.style.fontSize = '0.75em';
            statusSpan.style.fontWeight = '600';
            statusSpan.textContent = report.status.toUpperCase();
            statusBadge.appendChild(statusSpan);
            popupDiv.appendChild(statusBadge);
            
            const categoryDiv = document.createElement('div');
            categoryDiv.style.fontSize = '0.85em';
            categoryDiv.style.color = '#6B7280';
            categoryDiv.style.marginBottom = '4px';
            categoryDiv.innerHTML = '<strong>Category:</strong> ';
            categoryDiv.appendChild(document.createTextNode(report.category.name));
            popupDiv.appendChild(categoryDiv);
            
            const userDiv = document.createElement('div');
            userDiv.style.fontSize = '0.85em';
            userDiv.style.color = '#6B7280';
            userDiv.style.marginBottom = '4px';
            userDiv.innerHTML = '<strong>Reported by:</strong> ';
            userDiv.appendChild(document.createTextNode(report.user.name));
            popupDiv.appendChild(userDiv);
            
            if (report.authority) {
                const authorityDiv = document.createElement('div');
                authorityDiv.style.fontSize = '0.85em';
                authorityDiv.style.color = '#6B7280';
                authorityDiv.style.marginBottom = '8px';
                authorityDiv.innerHTML = '<strong>Authority:</strong> ';
                authorityDiv.appendChild(document.createTextNode(report.authority.name));
                popupDiv.appendChild(authorityDiv);
            }
            
            if (report.photos.length > 0) {
                const photoDiv = document.createElement('div');
                photoDiv.style.marginTop = '8px';
                const img = document.createElement('img');
                img.src = `/storage/${report.photos[0].path}`;
                img.style.width = '100%';
                img.style.borderRadius = '4px';
                img.style.maxHeight = '150px';
                img.style.objectFit = 'cover';
                img.alt = `Photo of ${report.title}`;
                photoDiv.appendChild(img);
                popupDiv.appendChild(photoDiv);
            }

            marker.bindPopup(popupDiv);
            
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
