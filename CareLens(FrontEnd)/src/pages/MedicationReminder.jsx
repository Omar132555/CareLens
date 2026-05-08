import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaSearch, FaBell } from 'react-icons/fa';
import NavBar from '../components/navBar';
import MedicationCard from '../components/MedicationCard';
import AddMedicationModal from '../components/AddMedicationModal';
import EditMedicationModal from '../components/EditMedicationModal';
import medicationApi from '../services/medicationApi';

const MedicationReminder = () => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [toast, setToast] = useState(null);
  const notificationIntervalRef = useRef(null);
  const notifiedMedicationsRef = useRef(new Set());

  useEffect(() => {
    fetchMedications();
    requestNotificationPermission();
    startReminderCheck();

    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const filtered = medications.filter(med =>
      med.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMedications(filtered);
  }, [medications, searchTerm]);

  const fetchMedications = async () => {
    try {
      const response = await medicationApi.getMedications();
      setMedications(response.data.data || response.data);
    } catch (error) {
      showToast('Error fetching medications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const startReminderCheck = () => {
    notificationIntervalRef.current = setInterval(() => {
      checkReminders();
    }, 60000); // Check every 60 seconds
  };

  const checkReminders = () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    medications.forEach(med => {
      if (med.is_active && med.schedule_time === currentTime) {
        if (!notifiedMedicationsRef.current.has(med.id)) {
          showNotification(med);
          notifiedMedicationsRef.current.add(med.id);

          // Reset notification flag after 1 hour
          setTimeout(() => {
            notifiedMedicationsRef.current.delete(med.id);
          }, 3600000);
        }
      }
    });
  };

  const showNotification = (medication) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medication Reminder', {
        body: `Time to take ${medication.medication_name} - ${medication.dosage}`,
        icon: '/pills-icon.png', // You can add an icon
      });
    }
    showToast(`Reminder: Take ${medication.medication_name}`, 'info');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddMedication = async (data) => {
    await medicationApi.createMedication(data);
    fetchMedications();
    showToast('Medication added successfully');
  };

  const handleEditMedication = async (id, data) => {
    await medicationApi.updateMedication(id, data);
    fetchMedications();
    showToast('Medication updated successfully');
  };

  const handleDeleteMedication = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      await medicationApi.deleteMedication(id);
      fetchMedications();
      showToast('Medication deleted successfully');
    }
  };

  const openEditModal = (medication) => {
    setEditingMedication(medication);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Medication Reminder</h1>
            <p className="text-gray-600">Manage your medications and get timely reminders</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Medication</span>
          </button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => showToast('Notifications enabled', 'info')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
          >
            <FaBell />
            <span>Test Notification</span>
          </button>
        </div>

        {filteredMedications.length === 0 ? (
          <div className="text-center py-12">
            <FaPlus className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No medications found</h3>
            <p className="text-gray-500">Add your first medication to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedications.map(medication => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onEdit={openEditModal}
                onDelete={handleDeleteMedication}
              />
            ))}
          </div>
        )}

        <AddMedicationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddMedication}
        />

        <EditMedicationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEdit={handleEditMedication}
          medication={editingMedication}
        />

        {toast && (
          <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationReminder;
// Modified by Mahmoud Rafat
// Created MedicationReminder main component with full CRUD functionality, search, notifications, and responsive UI