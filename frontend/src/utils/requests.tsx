import axios from 'axios';

const url = 'http://localhost:8000';

/**
 * This function is used to get a generic data from the backend
 * @param data is the data we want from the backend
 * @returns the data we want
 */
const getData = async (data: string) => {
    // 'await' the data
    const response = await axios.get(`${url}/getData`, {params: {data: data}});
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
    const response = await axios.get(`${url}/getParkingRequests`, { params: {zone: zone}});
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
    const response = await axios.get(`${url}/kmeans`, { params: {size: size}});
    if(response.status === 200) {
        return response.data;
    }
    else {
        return null;
    }
}

/**
 * This function is used to get the DBSCAN data from the backend
 * @param epsilon is radius of the neighborhood to be considered
 * @param minPts is the minimum number of points to form a cluster
 * @returns the DBSCAN data (clusters)
 */
const dbscan = async (epsilon: number, minPoints: number) => {
    // 'await' the data
    const response = await axios.get(`${url}/dbscan`, { params: {epsilon: epsilon, minPoints: minPoints}});
    if(response.status === 200) {
        return response.data;
    }
    else {
        return null;
    }
}

/**
 * 
 * @returns 
 */
const heatmap = async () => {
    // 'await' the data
    const response = await axios.get(`${url}/heatmap`);
    if(response.status === 200) {
        return response.data;
    }
    else {
        return null;
    }
}

/**
 * 
 * @returns 
 */
const eChargers = async () => {
    // 'await' the data
    const response = await axios.get(`${url}/e-chargers`);
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
    const response = await axios.get(`${url}/getAllParkings`);
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
    const response = await axios.get(`${url}/getParkingsFromZone`, {params: {zone: zone}});
    if(response.status === 200) {
        return response.data.parkings;
    }
    else {
        return null;
    }
};


export { getData, kmeans, dbscan, heatmap, getParkingRequestFromZone, getAllParkings, getParkings, eChargers};
