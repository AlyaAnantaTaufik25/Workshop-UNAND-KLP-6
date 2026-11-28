import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function LeafletGeofencePicker({ lat, lng, radius, onLocationChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const popupRef = useRef(null);

  const initialLat = parseFloat(lat) || -0.914488;
  const initialLng = parseFloat(lng) || 100.466542;
  const initialRadius = parseFloat(radius) || 50;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inisialisasi Map Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    // Tile layer OpenStreetMap standar persis gambar
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Lingkaran geofence warna biru cerah (#007bff / #0099ff) seperti gambar contoh
    const circle = L.circle([initialLat, initialLng], {
      radius: initialRadius,
      color: '#0088ff',
      fillColor: '#80c4ff',
      fillOpacity: 0.35,
      weight: 3,
    }).addTo(map);
    circleRef.current = circle;

    // Marker pin biru standar Leaflet
    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // Popup bawaan Leaflet persis seperti gambar contoh
    const popupContent = `
      <div style="font-family: inherit; line-height: 1.4; padding: 2px 0;">
        <div style="font-weight: 700; font-size: 13px; color: #1f2937; margin-bottom: 2px;">
          Titik Lokasi Gedung
        </div>
        <div style="font-size: 11.5px; color: #4b5563;">
          Klik peta atau geser pin untuk menentukan titik.
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      autoClose: false,
      closeOnClick: false,
      closeButton: true,
      offset: [0, -14],
    }).openPopup();

    // Event saat pin digeser (drag)
    marker.on('drag', () => {
      const pos = marker.getLatLng();
      circle.setLatLng(pos);
    });

    // Event saat pin selesai digeser (dragend)
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      circle.setLatLng(position);
      marker.openPopup();
      onLocationChange(position.lat.toFixed(6), position.lng.toFixed(6));
    });

    // Event saat peta diklik
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
      marker.openPopup();
      onLocationChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
    };
  }, []);

  // Update radius lingkaran ketika slider diubah
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(parseFloat(radius) || 50);
    }
  }, [radius]);

  // Update posisi marker jika lat/lng berubah dari luar (misal tombol lokasi saya)
  useEffect(() => {
    const curLat = parseFloat(lat);
    const curLng = parseFloat(lng);
    if (!isNaN(curLat) && !isNaN(curLng) && markerRef.current && circleRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - curLat) > 0.00001 || Math.abs(currentPos.lng - curLng) > 0.00001) {
        const newPos = [curLat, curLng];
        markerRef.current.setLatLng(newPos);
        circleRef.current.setLatLng(newPos);
        markerRef.current.openPopup();
        mapInstanceRef.current.panTo(newPos);
      }
    }
  }, [lat, lng]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '350px',
        backgroundColor: '#e5e7eb',
        position: 'relative',
        zIndex: 1,
        borderRadius: '0 0 4px 4px',
      }}
    />
  );
}
