import axios from "axios";
import API_BASE_URL from '../config/api'

const API = axios.create({
  baseURL: `$${API_BASE_URL}/api/v1/stories`,
});


API.interceptors.request.use((req) => {

  const authData = localStorage.getItem("authData");

  if (authData) {

    const parsed = JSON.parse(authData);

    if (parsed.accessToken) {
      req.headers.Authorization = `Bearer ${parsed.accessToken}`;
    }

  }

  return req;

});

export const createStoryAPI = (formData) =>
  API.post("/create", formData);


export const getStoriesFeedAPI = () =>
  API.get("/feed");


export const getArchivedStoriesAPI = () =>
  API.get("/archive");


export const viewStoryAPI = (storyId) =>
  API.post(`/view/${storyId}`);


export const deleteStoryAPI = (storyId) =>
  API.delete(`/delete/${storyId}`);