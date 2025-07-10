import React, { useContext, useEffect, useState } from 'react';
import { PropertyContext } from '../contexts/PropertyContext';
import { useNavigate } from 'react-router-dom';
import AddPropertyForm from '../components/AddPropertyForm';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
};

export default function PropertyPicker() {
  const { properties, switchProperty, loading } = useContext(PropertyContext);
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState(false);

  // New state for modal
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!loading && properties.length === 1) {
      handleSelect(properties[0]);
    }
    if (!loading && properties.length === 0) {
      navigate('/onboarding');
    }
    // eslint-disable-next-line
  }, [properties, loading]);

  const handleSelect = async (property) => {
    setSelecting(true);
    try {
      await switchProperty(property);
      navigate(`/dashboard/${property.id}`);
    } catch (e) {
      // handle error
    } finally {
      setSelecting(false);
    }
  };

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-operon-background pt-24 flex flex-col items-center justify-start px-4"
      >
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
                    disabled={selecting}
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
              onClick={() => setShowAddModal(true)}
              className="text-operon-blue hover:underline text-sm"
            >
              + Add a new property
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal for Add Property (with animation) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl relative"
              initial={{ scale: 0.92, y: 48, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 32, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            >
              <button
                className="absolute top-2 right-3 text-xl text-gray-500 hover:text-gray-800"
                onClick={() => setShowAddModal(false)}
              >×</button>
              <AddPropertyForm onClose={() => setShowAddModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
