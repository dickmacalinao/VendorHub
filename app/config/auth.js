import AsyncStorage from '@react-native-community/async-storage';
import base64 from 'react-native-base64'

export const TOKEN_KEY = "AuthToken";
export const USER_ROLE = "UserRole";
export const VENDOR_ID = "VendorId";


export const onSignIn = (token) => AsyncStorage.setItem(TOKEN_KEY, token);

export const onSignOut = () => {

    return new Promise((resolve, reject) => {


        AsyncStorage.removeItem('ProdGroups');
        AsyncStorage.removeItem('ProdGroup');
        AsyncStorage.removeItem('VendorDiscount');
        AsyncStorage.removeItem('Vendors');
        AsyncStorage.removeItem('VendorDiscount');
        AsyncStorage.removeItem('AppUserList');

        AsyncStorage.removeItem(TOKEN_KEY)
            .then(res => {
                resolve(true);
            })
            .catch(err => reject(err));
    });
};

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);

export const isSignedIn = () => {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem(TOKEN_KEY)
            .then(token => {
                if (token !== null) {
                  resolve(true);
                } else {
                  resolve(false);
                }
            })
            .catch(err => reject(err));
    });
};

export const getPayload = () => {
    return new Promise((resolve, reject) => {
        try {
            getToken()
            .then(token => {
                var payload = base64.decode(token.split('.')[1]);
                payload = payload.replace(/\0/g,'');        // replace extra \u0000
                resolve(JSON.parse(payload));
            })

        }
        catch (err) {
            reject(err);
        }
    });
};

export const validateIfStillAuthorized = (navigation, status) => {

    // Check if http response is 401 (Unauthorized) then load login page
    if ( status=='401' ) {
        navigation.navigate('Login');
        return false;
    }
    return true;
}

