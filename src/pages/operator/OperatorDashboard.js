import React, { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';

export default function OperatorDashboard() {
  const { user, profile } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);

  const [vehicleForm, setVehicleForm] = useState({ type: 'Cab', model: '', seatingCapacity: '', basePrice: '' });
  const [packageForm, setPackageForm] = useState({ title: '', duration: '', basePrice: '', status: 'draft' });

  const operatorId = user?.uid;

  const operatorName = useMemo(() => profile?.name || user?.displayName || 'Operator', [profile, user]);

  useEffect(() => {
    if (!operatorId || !db) return;

    const vehiclesQuery = query(
      collection(db, 'vehicles'),
      where('operatorId', '==', operatorId),
      orderBy('createdAt', 'desc')
    );

    const packagesQuery = query(
      collection(db, 'packages'),
      where('operatorId', '==', operatorId),
      orderBy('createdAt', 'desc')
    );

    const unsubVehicles = onSnapshot(vehiclesQuery, (snap) => {
      setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubPackages = onSnapshot(packagesQuery, (snap) => {
      setPackages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubVehicles();
      unsubPackages();
    };
  }, [operatorId]);

  async function createVehicle(e) {
    e.preventDefault();
    if (!operatorId || !db) return;

    await addDoc(collection(db, 'vehicles'), {
      operatorId,
      type: vehicleForm.type,
      model: vehicleForm.model,
      seatingCapacity: Number(vehicleForm.seatingCapacity || 0),
      amenities: [],
      images: [],
      basePrice: Number(vehicleForm.basePrice || 0),
      availability: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setVehicleForm({ type: 'Cab', model: '', seatingCapacity: '', basePrice: '' });
  }

  async function createPackage(e) {
    e.preventDefault();
    if (!operatorId || !db) return;

    await addDoc(collection(db, 'packages'), {
      operatorId,
      title: packageForm.title,
      originLocationId: null,
      destinations: [],
      itinerary: [],
      duration: packageForm.duration,
      inclusions: [],
      exclusions: [],
      amenities: [],
      images: [],
      basePrice: Number(packageForm.basePrice || 0),
      availability: [],
      status: packageForm.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setPackageForm({ title: '', duration: '', basePrice: '', status: 'draft' });
  }

  return (
    <div className="container py-5">
      <h2 className="mb-1">Operator Dashboard</h2>
      <div className="text-muted mb-4">Welcome, {operatorName}</div>

      {!isFirebaseConfigured ? (
        <div className="alert alert-warning">
          Firebase is not configured. Create a <strong>.env</strong> file using <strong>.env.example</strong> and restart <strong>npm start</strong>.
        </div>
      ) : null}

      <div className="alert alert-info">
        Verification: <strong>{profile?.verificationStatus || 'pending'}</strong>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Add Vehicle</h5>
              <form onSubmit={createVehicle}>
                <div className="mb-2">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={vehicleForm.type} onChange={(e) => setVehicleForm((p) => ({ ...p, type: e.target.value }))}>
                    <option>Cab</option>
                    <option>Traveller</option>
                    <option>Bus</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Model</label>
                  <input className="form-control" value={vehicleForm.model} onChange={(e) => setVehicleForm((p) => ({ ...p, model: e.target.value }))} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Seating capacity</label>
                  <input className="form-control" type="number" min="1" value={vehicleForm.seatingCapacity} onChange={(e) => setVehicleForm((p) => ({ ...p, seatingCapacity: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Base price</label>
                  <input className="form-control" type="number" min="0" value={vehicleForm.basePrice} onChange={(e) => setVehicleForm((p) => ({ ...p, basePrice: e.target.value }))} required />
                </div>
                <button className="btn btn-primary" type="submit">Create vehicle</button>
              </form>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Your Vehicles</h5>
              {vehicles.length === 0 ? (
                <div className="text-muted">No vehicles yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Model</th>
                        <th>Seats</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((v) => (
                        <tr key={v.id}>
                          <td>{v.type}</td>
                          <td>{v.model}</td>
                          <td>{v.seatingCapacity}</td>
                          <td>{v.basePrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Add Package</h5>
              <form onSubmit={createPackage}>
                <div className="mb-2">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={packageForm.title} onChange={(e) => setPackageForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Duration</label>
                  <input className="form-control" value={packageForm.duration} onChange={(e) => setPackageForm((p) => ({ ...p, duration: e.target.value }))} placeholder="e.g., 3 Days" required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Base price</label>
                  <input className="form-control" type="number" min="0" value={packageForm.basePrice} onChange={(e) => setPackageForm((p) => ({ ...p, basePrice: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={packageForm.status} onChange={(e) => setPackageForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <button className="btn btn-primary" type="submit">Create package</button>
              </form>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Your Packages</h5>
              {packages.length === 0 ? (
                <div className="text-muted">No packages yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.map((p) => (
                        <tr key={p.id}>
                          <td>{p.title}</td>
                          <td>{p.duration}</td>
                          <td>{p.status}</td>
                          <td>{p.basePrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
