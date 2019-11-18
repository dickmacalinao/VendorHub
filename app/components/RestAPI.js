import AsyncStorage from '@react-native-community/async-storage';
import { getToken } from "../config/auth";

export function requestAPIDirect (reqUrl, reqMethod, reqHeader, reqBody) {
   return fetch(reqUrl, {
       method: reqMethod,
       headers: reqHeader,
       body: reqBody});
}
// This method is created to handling the ping of the internal service before calling the service from gateway
// This particularly API deployed in free dyno from Heroku where service sleeps after 30 minutes of idle
export function requestAPI (serviceName, uri, reqMethod, reqBody) {

    return new Promise((resolve, reject) => {

        getToken()
            .then(myToken => {
                AsyncStorage.getItem(serviceName)
                    .then(serviceURL => {
                        var jsonService = JSON.parse(serviceURL);
                        fetch(jsonService.internalService, {method: 'GET'})
                            .then(res => {
                                if ( res.status == 200 || res.status == 401 ) {
                                    var reqUrl = jsonService.externalService + uri;
                                    var reqHeader = {
                                        'Authorization': myToken,
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    };

                                    //alert(JSON.stringify(reqHeader));

                                    if ( reqMethod == 'GET' ) {
                                        resolve(fetch(reqUrl, {method: reqMethod, headers: reqHeader}));
                                    } else {
                                        //alert(reqUrl + "++++" + reqMethod);
                                        resolve(fetch(reqUrl, {method: reqMethod, headers: reqHeader, body: JSON.stringify(reqBody)}));
                                    }
                                }
                            })
                            .catch(error => reject({'message': 'Internal service is down. Please contact system administrator.', 'type': 'ERROR'}));
                    })
                    .catch(error => reject({'message': 'Service not found. Please contact system administrator.', 'type': 'ERROR'}));

            })
            .catch(error => reject({'message': 'Required token is missing. Please try again.', 'type': 'ERROR'}));

    });

}


export function requestAPIWoToken(serviceName, uri, reqMethod, reqBody) {

    return new Promise((resolve, reject) => {
        AsyncStorage.getItem(serviceName)
            .then(serviceURL => {
                var jsonService = JSON.parse(serviceURL);
                fetch(jsonService.internalService, {method: 'GET'})
                    .then(res => {
                        if ( res.status == 200 || res.status == 401 ) {
                            var reqUrl = jsonService.externalService + uri;
                            var reqHeader = {
                               'Accept': 'application/json',
                               'Content-Type': 'application/json'
                            };
                            if ( reqMethod == 'GET' ) {
                                resolve(fetch(reqUrl, {method: reqMethod, headers: reqHeader}));
                            } else {
                                resolve(fetch(reqUrl, {method: reqMethod, headers: reqHeader, body: JSON.stringify(reqBody)}));
                            }
                        }
                    })
                    .catch(error => reject({'message': 'Internal service is down. Please try again.', 'type': 'ERROR'}));
            })
            .catch(error => reject({'message': 'Service not found. Please contact system administrator.', 'type': 'ERROR'}));
    });
}