import axios from 'axios';
import jwtDecode from 'jwt-decode';
import FuseUtils from '@fuse/FuseUtils';

class jwtService extends FuseUtils.EventEmitter {

    init()
    {
        this.setInterceptors();
        this.handleAuthentication();
    }

    setInterceptors = () => {
        axios.interceptors.response.use(response => {
            return response;
        }, err => {
            return new Promise((resolve, reject) => {
                if ( err.response.status === 401 && err.config && !err.config.__isRetryRequest )
                {
                    // if you ever get an unauthorized response, logout the user
                    this.emit('onAutoLogout', 'Invalid access_token');
                    this.setSession(null);
                }
                throw err;
            });
        });
    };

    handleAuthentication = () => {

        let access_token = this.getAccessToken();

        if ( !access_token )
        {
            this.emit('onNoAccessToken');

            return;
        }

        if ( this.isAuthTokenValid(access_token) )
        {
            this.setSession(access_token);
            this.emit('onAutoLogin', true);
        }
        else
        {
            this.setSession(null);
            this.emit('onAutoLogout', 'access_token expired');
        }
    };

    createUser = (data) => {
        return new Promise((resolve, reject) => {
            axios.post('/api/auth/register', data)
                .then(response => {
                    if ( response.data.user )
                    {
                        this.setSession(response.data.access_token);
                        resolve(response.data.user);
                    }
                    else
                    {
                        reject(response.data.error);
                    }
                });
        });
    };

    signInWithEmailAndPassword = (username, password) => {
        return new Promise((resolve, reject) => {
            axios.get(`${process.env.REACT_API_URL}/api/auth`, {
                data: {
                    authDetails: {
                        username,
                        password
                    }
                }
            }).then(response => {
                if ( response.data.authDetails )
                {
                    this.setSession(response.data.accessToken, response.data.refreshToken);
                    resolve(response.data.user);
                }
                else
                {
                    reject(response.data.msg);
                }
            });
        });
    };

    signInWithToken = () => {
        return new Promise((resolve, reject) => {
            axios.get('/api/auth/access-token', {
                data: {
                    access_token: this.getAccessToken()
                }
            })
                .then(response => {
                    if ( response.data.user )
                    {
                        this.setSession(response.data.access_token);
                        resolve(response.data.user);
                    }
                    else
                    {
                        this.logout();
                        reject('Failed to login with token.');
                    }
                })
                .catch(error => {
                    this.logout();
                    reject('Failed to login with token.');
                });
        });
    };

    updateUserData = (user) => {
        return axios.post('/api/auth/user/update', {
            user: user
        });
    };

    setSession = (accessToken, refreshToken) => {
				if(refreshToken) {
					localStorage.setItem('refreshToken', refreshToken);
				} else {
					localStorage.removeItem('refreshToken');
				}
        if ( accessToken )
        {
            localStorage.setItem('authToken', accessToken);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        }
        else
        {
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
        }
		};
		
		refreshAccessToken = async (refreshToken) => {
			if(!refreshToken){
				this.setSession(null, null);
				this.emit('onAutoLogout');
			}

			
		};

    logout = () => {
        this.setSession(null);
    };

    isAuthTokenValid = access_token => {
        if ( !access_token )
        {
            return false;
        }
        const decoded = jwtDecode(access_token);
        const currentTime = Date.now() / 1000;
        if ( decoded.exp < currentTime )
        {
            console.warn('access token expired');
            return false;
        }
        else
        {
            return true;
        }
    };

    getAccessToken = () => {
        return window.localStorage.getItem('authToken');
    };
}

const instance = new jwtService();

export default instance;
