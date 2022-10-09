/* ( NOTE : file copied as-is, not used from App component ) */

import axios from 'axios';
import fakeData from "../persons5000.json";

/**
 * It is good practice to have all the api calls in a folder
 * See the remarks for Store which also applies here.
 * Code that is structured with clear responsibilities is easier
 * to track and maintain.
 * If we are calling the backend from all over the place this would be much harder to follow.
 */

// using axios here, which does wrap fetch and provides some great hooks, once we need to have interceptors
// (for authentication & authorization for instance)
const _axios = axios.create({
    withCredentials: false,
    headers: {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      }
  });

const fetchPersons = async (amount) => {
    // const url = `https://randomuser.me/api?results=${amount}`
    // const { data } = await _axios.get(url)
    // randomuser.me seems to be down quite often, just use fake data
    return fakeData.results
}

export  {
    fetchPersons
}