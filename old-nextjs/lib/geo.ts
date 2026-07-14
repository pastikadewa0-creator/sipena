/**
 * Menghitung jarak antara 2 titik koordinat bumi dalam satuan meter
 * Menggunakan rumus Haversine.
 * 
 * @param lat1 Latitude titik 1
 * @param lon1 Longitude titik 1
 * @param lat2 Latitude titik 2
 * @param lon2 Longitude titik 2
 * @returns Jarak dalam meter
 */
export function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Radius bumi dalam meter (m)
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Jarak dalam m
  
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
