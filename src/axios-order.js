import axios from "axios";



const instance = axios.create({
    baseURL: 'https://my-react-burgerbuilder-app-default-rtdb.firebaseio.com'
});

export default instance;