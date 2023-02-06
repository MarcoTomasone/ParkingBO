import axios from 'axios';

/**
 * This function is used to get a generic data from the backend
 * @param data is the data we want from the backend
 * @returns the data we want
 */
const getData = async (data: string) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getData", { params: { data: data}});
    if(response.status === 200) {
        return response.data;
    } else {
        return null;
    }
};

/**
 * This function is used to get the parking requests from a specific zone
 * @param zone is the zone we want to get the parking requests from 
 * @returns the parking request events
 */
const getParkingRequestFromZone = async (zone: number) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getParkingRequests", { params: {zone: zone}});
    if(response.status === 200) {
        return response.data.requests;
    } else {
        return null;
    }
};

/**
 * This function is used to get the kmeans data from the backend
 * @param size is the number of clusters we want to get
 * @returns the kmeans data (clusters)
 */
const kmeans = async (size: number) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/kmeans", { params: {size: size}});
    if(response.status === 200) {
        return response.data;
    }
    else {
        return null;
    }
}
const heatmap = async () => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/heatmap");
    if(response.status === 200) {
        return response.data;
    }
    else {
        return null;
    }
}

const eChargers = async () => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/e-chargers");
    if(response.status === 200) {
        return response.data;
    }
    else {
        return null;
    }
}

/**
 * This function is used to get the number of the parkings for each zone
 * @returns the number of parkings for each zone
 */
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


export { getData, kmeans, heatmap, getParkingRequestFromZone, getAllParkings, getParkings, eChargers};
