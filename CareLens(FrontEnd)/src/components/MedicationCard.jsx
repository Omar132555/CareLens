import React from 'react';
import { FaPills, FaClock, FaEdit, FaTrash } from 'react-icons/fa';

const MedicationCard = ({ medication, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <FaPills className="text-blue-500 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-800">{medication.medication_name}</h3>
            <p className="text-sm text-gray-600">{medication.dosage}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(medication)}
            className="text-blue-500 hover:text-blue-700 p-1"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(medication.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center text-sm text-gray-600">
        <FaClock className="mr-2" />
        <span>{medication.schedule_time}</span>
      </div>
      {medication.notes && (
        <p className="mt-2 text-sm text-gray-700">{medication.notes}</p>
      )}
      <div className="mt-3 flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs ${medication.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {medication.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

export default MedicationCard;
// Modified by Mahmoud Rafat
// Created MedicationCard component to display individual medication details with edit and delete actions