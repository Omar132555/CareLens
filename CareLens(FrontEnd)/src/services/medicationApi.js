import axios from '../config';

const medicationApi = {
  getMedications: () => axios.get('/api/medications'),
  createMedication: (data) => axios.post('/api/medications', data),
  updateMedication: (id, data) => axios.put(`/api/medications/${id}`, data),
  deleteMedication: (id) => axios.delete(`/api/medications/${id}`),
};

export default medicationApi;
// Modified by Mahmoud Rafat
// Created medicationApi service for CRUD operations on medications using axios