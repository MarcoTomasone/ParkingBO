import axios from 'axios';

const getData = async (data: string) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getData", { params: { data: data}, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'  }});
    if(response.status === 200) {
        return response.data;
    } else {
        return null;
    }
};

const getParkingsFromZone = async (zone: number) => {
    // 'await' the data
    const response = await axios.get("http://localhost:8000/getData", { params: { zone: "zone" }, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'  }});
    console.log(response);
    if(response.status === 200) {
        return response.data;
    }
    else {
        return null;
    }
};

export { getData, getParkingsFromZone };