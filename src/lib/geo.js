// Geo math for fire lookout cross-shots.
// All bearings are in degrees clockwise from north.
// Distances are in miles internally; lat/lng in decimal degrees.

const EARTH_RADIUS_MI = 3958.7613;
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/**
 * Magnetic declination (rough) for a point in northern Arizona.
 * Positive = east declination, meaning magnetic north is east of true north.
 * Flagstaff area is ~9.5° E in 2026. For an app at this scale, a constant
 * works fine; if expanding nationally, swap in a WMM library.
 */
export const DEFAULT_DECLINATION_DEG = 9.5;

/**
 * Convert a magnetic bearing to true bearing.
 * True = Magnetic + East declination.
 */
export function magneticToTrue(magneticBearing, declination = DEFAULT_DECLINATION_DEG) {
  return normalizeBearing(magneticBearing + declination);
}

/**
 * Convert a true bearing to magnetic bearing.
 */
export function trueToMagnetic(trueBearing, declination = DEFAULT_DECLINATION_DEG) {
  return normalizeBearing(trueBearing - declination);
}

/**
 * Wrap a bearing into [0, 360).
 */
export function normalizeBearing(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Given a starting lat/lng, a true bearing in degrees, and a distance in miles,
 * return the destination lat/lng using great-circle (spherical earth) math.
 * Accurate enough for lookout ranges; doesn't fall apart on long shots.
 */
export function destinationPoint(lat, lng, trueBearingDeg, distanceMi) {
  const angularDist = distanceMi / EARTH_RADIUS_MI;
  const bearing = trueBearingDeg * DEG;
  const lat1 = lat * DEG;
  const lng1 = lng * DEG;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDist) +
    Math.cos(lat1) * Math.sin(angularDist) * Math.cos(bearing)
  );

  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDist) * Math.cos(lat1),
    Math.cos(angularDist) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    lat: lat2 * RAD,
    lng: ((lng2 * RAD + 540) % 360) - 180,
  };
}

/**
 * Great-circle distance between two points, in miles.
 */
export function distanceBetween(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * DEG;
  const dLng = (lng2 - lng1) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Initial true bearing from point 1 to point 2, in degrees.
 */
export function bearingBetween(lat1, lng1, lat2, lng2) {
  const lat1r = lat1 * DEG;
  const lat2r = lat2 * DEG;
  const dLng = (lng2 - lng1) * DEG;
  const y = Math.sin(dLng) * Math.cos(lat2r);
  const x =
    Math.cos(lat1r) * Math.sin(lat2r) -
    Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
  return normalizeBearing(Math.atan2(y, x) * RAD);
}

/**
 * Intersection of two great-circle paths defined by start points and bearings.
 * Returns null if the paths are parallel or otherwise fail to intersect.
 * Adapted from Ed Williams' aviation formulary.
 */
export function intersectionOfBearings(lat1, lng1, brng1, lat2, lng2, brng2) {
  const φ1 = lat1 * DEG, λ1 = lng1 * DEG;
  const φ2 = lat2 * DEG, λ2 = lng2 * DEG;
  const θ13 = brng1 * DEG, θ23 = brng2 * DEG;

  const Δφ = φ2 - φ1;
  const Δλ = λ2 - λ1;

  // Angular distance from p1 to p2
  const δ12 = 2 * Math.asin(Math.sqrt(
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  ));
  if (Math.abs(δ12) < 1e-12) return { lat: lat1, lng: lng1 };

  // Initial/final bearings between points
  let θa = Math.acos(
    (Math.sin(φ2) - Math.sin(φ1) * Math.cos(δ12)) /
    (Math.sin(δ12) * Math.cos(φ1))
  );
  if (Number.isNaN(θa)) θa = 0;
  const θb = Math.acos(
    (Math.sin(φ1) - Math.sin(φ2) * Math.cos(δ12)) /
    (Math.sin(δ12) * Math.cos(φ2))
  );

  const θ12 = Math.sin(λ2 - λ1) > 0 ? θa : 2 * Math.PI - θa;
  const θ21 = Math.sin(λ2 - λ1) > 0 ? 2 * Math.PI - θb : θb;

  const α1 = θ13 - θ12;
  const α2 = θ21 - θ23;

  if (Math.sin(α1) === 0 && Math.sin(α2) === 0) return null; // infinite intersections
  if (Math.sin(α1) * Math.sin(α2) < 0) return null;          // ambiguous, opposite hemispheres

  const α3 = Math.acos(
    -Math.cos(α1) * Math.cos(α2) +
    Math.sin(α1) * Math.sin(α2) * Math.cos(δ12)
  );

  const δ13 = Math.atan2(
    Math.sin(δ12) * Math.sin(α1) * Math.sin(α2),
    Math.cos(α2) + Math.cos(α1) * Math.cos(α3)
  );

  const φ3 = Math.asin(
    Math.sin(φ1) * Math.cos(δ13) +
    Math.cos(φ1) * Math.sin(δ13) * Math.cos(θ13)
  );

  const Δλ13 = Math.atan2(
    Math.sin(θ13) * Math.sin(δ13) * Math.cos(φ1),
    Math.cos(δ13) - Math.sin(φ1) * Math.sin(φ3)
  );

  const λ3 = λ1 + Δλ13;

  return {
    lat: φ3 * RAD,
    lng: ((λ3 * RAD + 540) % 360) - 180,
  };
}

/**
 * Given an array of shots [{ lookout, bearing, range, useMagnetic, declination }],
 * compute the resolved endpoint for each (for drawing the ray) and all pairwise
 * intersections of the rays (for showing likely smoke locations).
 *
 * Returns: { rays: [{shot, end}], intersections: [{lat, lng, shotA, shotB, distanceFromA, distanceFromB}] }
 */
export function resolveShots(shots) {
  const rays = shots.map((shot) => {
    const trueBearing = shot.useMagnetic
      ? magneticToTrue(shot.bearing, shot.declination ?? DEFAULT_DECLINATION_DEG)
      : shot.bearing;
    const end = destinationPoint(
      shot.lookout.lat,
      shot.lookout.lng,
      trueBearing,
      shot.range
    );
    return { shot, trueBearing, end };
  });

  const intersections = [];
  for (let i = 0; i < rays.length; i++) {
    for (let j = i + 1; j < rays.length; j++) {
      const a = rays[i];
      const b = rays[j];
      // Don't cross a shot with itself or with a shot from the same lookout
      if (a.shot.lookout.id === b.shot.lookout.id) continue;

      const point = intersectionOfBearings(
        a.shot.lookout.lat, a.shot.lookout.lng, a.trueBearing,
        b.shot.lookout.lat, b.shot.lookout.lng, b.trueBearing
      );
      if (!point) continue;

      const distanceFromA = distanceBetween(
        a.shot.lookout.lat, a.shot.lookout.lng, point.lat, point.lng
      );
      const distanceFromB = distanceBetween(
        b.shot.lookout.lat, b.shot.lookout.lng, point.lat, point.lng
      );

      // Sanity filter: discard intersections far behind the lookout's ray
      // (great-circle intersection can produce antipodal solutions)
      const maxReasonable = Math.max(a.shot.range, b.shot.range) * 3 + 50;
      if (distanceFromA > maxReasonable || distanceFromB > maxReasonable) continue;

      intersections.push({
        lat: point.lat,
        lng: point.lng,
        shotA: a.shot,
        shotB: b.shot,
        distanceFromA,
        distanceFromB,
      });
    }
  }

  return { rays, intersections };
}