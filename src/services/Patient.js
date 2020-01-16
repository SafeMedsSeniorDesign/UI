import Axios from 'axios';

export async function getPatientList(doctorId){
  const patients = await Axios.get(`${process.env.REACT_APP_API_URL}/api/patient-service/patient/list?doctorId=${doctorId}`);
  return patients.data || {patients: []};
}

export async function getPatientBySSN(ssn){
  const patient = await Axios.get(`${process.env.REACT_APP_API_URL}/api/patient-service/patient`, {params: {ssn}});
  return patient !== undefined ? patient.data.patient : {};
}

export async function createPatient(patientInfo){
  const patient = await Axios.post(`${process.env.REACT_APP_API_URL}/api/patient-service/patient`, {patient: {...patientInfo}});
  console.log(patient)
}