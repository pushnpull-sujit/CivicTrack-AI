import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({ complaints = [], onMarkerClick = null, center = [37.7749, -122.4194], zoom = 13, interactive = true, onMapClick = null, reportPin = null }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const reportMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive
    }).setView(center, zoom);

    mapRef.current = map;

    // Add Tile Layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center if map already initialized
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update report marker when reportPin changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (reportMarkerRef.current) {
      map.removeLayer(reportMarkerRef.current);
      reportMarkerRef.current = null;
    }

    if (reportPin && reportPin[0] && reportPin[1]) {
      const customHtml = `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute inline-flex h-full w-full rounded-full bg-emerald-500 animate-ping opacity-75"></div>
          <div class="relative w-4.5 h-4.5 rounded-full bg-emerald-600 ring-4 ring-emerald-300 flex items-center justify-center shadow-md">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(reportPin, { icon: customIcon }).addTo(map);
      reportMarkerRef.current = marker;
    }
  }, [reportPin]);

  // Handle map click
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !interactive || !onMapClick) return;

    const handleMapClick = (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [interactive, onMapClick]);

  // Update markers when complaints list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add new markers
    complaints.forEach(complaint => {
      if (!complaint.latitude || !complaint.longitude) return;

      // Color mapping based on priority
      let colorClass = 'bg-blue-500 ring-blue-300';
      let pulseClass = '';
      if (complaint.priority === 'Critical') {
        colorClass = 'bg-rose-600 ring-rose-300';
        pulseClass = 'animate-ping opacity-75';
      } else if (complaint.priority === 'High') {
        colorClass = 'bg-amber-500 ring-amber-200';
        pulseClass = 'animate-ping opacity-60';
      } else if (complaint.priority === 'Low') {
        colorClass = 'bg-emerald-500 ring-emerald-200';
      }

      // Create a gorgeous custom HTML marker icon
      const customHtml = `
        <div class="relative flex items-center justify-center w-8 h-8">
          ${pulseClass ? `<div class="absolute inline-flex h-full w-full rounded-full ${colorClass.split(' ')[0]} ${pulseClass}"></div>` : ''}
          <div class="relative w-4 h-4 rounded-full ${colorClass} ring-4 flex items-center justify-center shadow-md">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Create marker
      const marker = L.marker([complaint.latitude, complaint.longitude], { icon: customIcon });

      // Create visual popup contents
      const popupHtml = `
        <div class="p-2 text-slate-800 font-sans" style="min-width: 180px;">
          <div class="flex items-center justify-between gap-2 border-b pb-1.5 mb-1.5">
            <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
              ${complaint._id}
            </span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${
              complaint.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
              complaint.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }">
              ${complaint.status}
            </span>
          </div>
          <h4 class="font-bold text-xs mb-1 truncate">${complaint.title || complaint.category}</h4>
          <p class="text-[10px] text-slate-500 truncate mb-1">Category: ${complaint.category}</p>
          <p class="text-[10px] text-slate-600 font-bold mb-2">Priority: ${complaint.priority}</p>
          <button id="btn-${complaint._id}" class="w-full text-center py-1 bg-indigo-600 text-white rounded text-[10px] font-semibold hover:bg-indigo-700 transition">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });

      // Attach click events
      marker.on('click', () => {
        if (onMarkerClick) {
          // Allow popup DOM to render, then attach click to button
          setTimeout(() => {
            const btn = document.getElementById(`btn-${complaint._id}`);
            if (btn) {
              btn.onclick = (e) => {
                e.stopPropagation();
                onMarkerClick(complaint);
                map.closePopup();
              };
            }
          }, 100);
        }
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [complaints, onMarkerClick]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full bg-slate-100 dark:bg-slate-900" />
    </div>
  );
}
