import axios from 'axios';

const getData = async (data: string) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getData", { params: { data: data}});
    if(response.status === 200) {
        return response.data;
    } else {
        return null;
    }
};

const getParkingRequestFromZone = async (zone: number) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getParkingRequests", { params: {zone: zone}});
    if(response.status === 200) {
        return response.data.requests;
    } else {
        return null;
    }
};

const getAllParkings = async () => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getAllParkings");
    if(response.status === 200) {
        return response.data.parkings;
    }
    else {
        return null;
    }
};

/**
 * This function is used to get parkings from a specific zone
 * @param zone a number that represents the zone 
 * @returns the number of parkings
 */
const getParkings = async (zone: number) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getParkingsFromZone", {params: {zone: zone}});
    if(response.status === 200) {
        return response.data.parkings;
    }
    else {
        return null;
    }
};

/**
 * This function is used to get all events from a specific zone
 * @param zone a number that represents the zone  
 * @returns an array of events
 */
const getAllEventsFromZone = async (zone: number) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getAllEventsFromZone", {params: {zone: zone}});
    if(response.status === 200) {
        return response.data.events;
    }
    else {
        return null;
    }
};

export { getData, getParkingRequestFromZone, getAllParkings, getParkings, getAllEventsFromZone };