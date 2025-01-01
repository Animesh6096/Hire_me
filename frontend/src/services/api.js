import axios from "axios"

const api = axios.create({
    baseURL: "http://127.0.0.1:5000",
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        // If token is invalid or expired, redirect to login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Define API methods
const apiMethods = {
    // User follow functionality
    followUser: (userId) => api.post(`/users/${userId}/follow`),
    getFollowStatus: (userId) => api.get(`/users/${userId}/follow-status`),
    
    // Other existing methods can be added here
};

export default { ...api, ...apiMethods };