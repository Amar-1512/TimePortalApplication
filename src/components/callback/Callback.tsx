import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/auth/success', { withCredentials: true })
            .then(response => {
                console.log('User Info:', response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/dashboard'); // Redirect to dashboard or home
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
                navigate('/login');
            });
    }, [navigate]);

    return <div>Loading...</div>;
}

export default Callback;