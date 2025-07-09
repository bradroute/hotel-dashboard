import React, { useContext, useEffect } from 'react';
import { PropertyContext } from '../contexts/PropertyContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PropertyPicker() {
  const { properties, loading } = useContext(PropertyContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If the user has only one property, auto-select it for convenience
    if (!loading && properties.length === 1) {
      navigate(`/dashboard/${properties[0].id}`);
    }
    // If user has no properties, redirect to onboarding as a failsafe
    if (!loading && properties.length === 0) {
      navigate('/onboarding');
    }
    // eslint-disable-next-line
  }, [properties, loading, navigate]);

  const handleSelect = (property) => {
    navigate(`/dashboard/${property.id}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-operon-background pt-24 flex flex-col items-center justify-start px-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg mt-10">
          <h1 className="text-2xl font-semibold mb-6 text-center text-operon-charcoal">
            Select a Property
          </h1>

          {loading ? (
            <div className="text-center text-lg">Loading properties…</div>
          ) : (
            <ul className="space-y-4">
              {properties.map((prop) => (
                <li
                  key={prop.id}
                  className="flex justify-between items-center border rounded p-4 hover:bg-operon-background transition"
                >
                  <div>
                    <div className="font-semibold text-operon-charcoal">{prop.name}</div>
                    <div className="text-sm text-gray-500">{prop.type}</div>
                  </div>
                  <button
                    onClick={() => handleSelect(prop)}
                    className="bg-operon-blue text-white px-4 py-2 rounded hover:bg-blue-400 transition"
                  >
                    Select
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/onboarding')}
              className="text-operon-blue hover:underline text-sm"
            >
              + Add a new property
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
