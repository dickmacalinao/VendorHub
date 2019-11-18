import React, { Component } from 'react';
import { View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    } from 'react-native';
import { Tile, Avatar } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';
import { Dropdown } from 'react-native-material-dropdown';
import ActionSheet from 'react-native-actionsheet';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker'
import AntDesign from 'react-native-vector-icons/AntDesign';

import { getPayload } from "../../config/auth";
import { USER_ROLE_APP_ADMIN, USER_ROLE_VENDOR_ADMIN, USER_ROLE_VENDOR_USER } from "../../config/constant";
import { requestAPI } from '../../components/RestAPI';
import { CustomButton } from '../../components/CommonComponent';
import CustomValidationMessage from '../../components/CustomValidationMessage';
import ValidationScheme from '../../components/ValidationScheme';
import '../../components/ValidateWrapper';
import { GENERIC_API_ERROR } from '../../config/messages';
import Colors from '../../components/Colors';

import { createVendorList } from "../../utils/AppUtil";

import CommonStyle from '../../styles/styles';

export default class extends Component {

    // Start Components triggers
    constructor(props) {
        super(props)
        this.state = {
            objectType: 'AppUser',
            username: '',
            name: '',
            role: '',
            objectRef: '',
            activeIndicator: false,
            userRole: '',
            updateMode: false,
            messages: [],
            uploadingImage: false,
            vendors: [],
            optionAction: [],
        };

        this.roles = [
            {value: USER_ROLE_APP_ADMIN, label: 'App Admin'},
            {value: USER_ROLE_VENDOR_ADMIN, label: 'Vendor Admin'},
            {value: USER_ROLE_VENDOR_USER, label: 'Vendor User'}
        ];

    }

    componentWillMount = () => {

        getPayload()
            .then(payload => {

                if (this.props.navigation.state.params) {
                    const { id, username, name, role, objectRef, activeIndicator } = this.props.navigation.state.params;
                    this.setState({
                        id: id,
                        username: username,
                        name: name,
                        role: role,
                        objectRef: objectRef,
                        activeIndicator: activeIndicator,
                        userRole: payload.role,
                        updateMode: true,
                        optionAction: [
                            'Save',
                            (activeIndicator ? 'Deactivate' : 'Activate'),
                            'Reset Password',
                            'Show History',
                            'Cancel',
                        ],
                    });
                } else {

                    if ( payload && ( payload.role==USER_ROLE_APP_ADMIN || payload.role==USER_ROLE_VENDOR_ADMIN ) ) {
                        this.setState({
                            userRole: payload.role,
                            objectRef: payload.objectRef,
                            updateMode: false,
                        });

                        if ( this.state.userRole == USER_ROLE_VENDOR_ADMIN ) {
                            this.setState({role: USER_ROLE_VENDOR_USER});
                            this.setState({objectRef: this.state.objectRef});
                        }

                    }

                }

                if ( payload && payload.role==USER_ROLE_APP_ADMIN ) {

                    AsyncStorage.getItem('Vendors').then(vendors => {

                        //alert(vendors);
                        var objVendors = JSON.parse(vendors);
                        if ( objVendors ) {
                            this.setState({vendors: objVendors});
                        } else {
                            this.retrieveAllVendors();
                        }

                    });

                }

            })

    }
    // End Components triggers


    // Start Component functions

    register = () => {

        var appUserRegistration = {
            id: this.state.id,
            username: this.state.username,
            name: this.state.name,
            role: this.state.role,
            objectRef: this.state.objectRef,
            activeIndicator: this.state.activeIndicator,
        };

        //alert(JSON.stringify(appUserRegistration));

        var errors = validateForm(appUserRegistration, (this.state.updateMode ? ValidationScheme.AppUserUpdate : ValidationScheme.AppUserRegistration));
        this.setState({messages: convertValErrorToAppError(errors)});

        if (!Array.isArray(errors) || !errors.length) {

            //alert(JSON.stringify(this.state.AppUserRegistration));

            var uri;
            if ( this.state.userRole == USER_ROLE_APP_ADMIN ) {
                uri =  this.state.updateMode ? '/appadmin/updateappuser' : '/appadmin/createappuser';
            } else if ( this.state.userRole == USER_ROLE_VENDOR_ADMIN ) {
                uri =  this.state.updateMode ? '/vendoradmin/updateappuser' : '/vendoradmin/createappuser';
            }

            //alert (uri);

            requestAPI('AppUserServiceURL', uri, 'POST', appUserRegistration)
                .then((response) => response.json() )
                .then((responseJson) => {
                    if ( responseJson.messages ) {
                        this.setState ({
                            messages: responseJson.messages,
                        });

                        if ( responseJson.appUser ) {
                           this.setState ({
                               id: responseJson.appUser.id,
                               username: responseJson.appUser.username,
                               name: responseJson.appUser.name,
                               role: responseJson.appUser.role,
                               objectRef: responseJson.appUser.objectRef,
                               activeIndicator: responseJson.appUser.activeIndicator,
                               updateMode: true,
                               optionAction: [
                                   'Save',
                                   (responseJson.appUser.activeIndicator ? 'Deactivate' : 'Activate'),
                                   'Reset Password',
                                    'Show History',
                                   'Cancel',
                               ],
                           });

                           // Release App User List cache, so it will pull fresh data in Order Update screen
                           AsyncStorage.removeItem('AppUserList');
                        }
                    } else if ( responseJson.error ) {
                        this.setState({
                            messages: [{
                                message: responseJson.error,
                                type: 'ERROR',
                            }]
                        })
                    }
                    //alert(JSON.stringify(responseJson));

                })
                .catch((error) => {
                    //alert(JSON.stringify(error));
                    this.setState({
                        messages: [GENERIC_API_ERROR]
                    })
                });

        }
    }

    doActivate = () => {

        var uri = this.state.userRole == USER_ROLE_APP_ADMIN ? '/appadmin' : '/vendoradmin';
        uri = uri + (this.state.activeIndicator ? '/deactivateappuser/' : '/activateappuser/') + this.state.id;

        requestAPI('AppUserServiceURL', uri, 'GET')
            .then((response) => response.json() )
            .then((responseJson) => {
                if ( responseJson.messages ) {
                    //alert(JSON.stringify(responseJson));
                    this.setState ({
                        messages: responseJson.messages,
                    });
                    if ( responseJson.appUser ) {
                        this.setState({
                            activeIndicator: responseJson.appUser.activeIndicator,
                            optionAction: [
                                'Save',
                                (responseJson.appUser.activeIndicator ? 'Deactivate' : 'Activate'),
                                'Reset Password',
                                    'Show History',
                                'Cancel',
                            ]
                        });

                        // Release App User List cache, so it will pull fresh data in Order Update screen
                        AsyncStorage.removeItem('AppUserList');
                    }
                } else if ( responseJson.error ) {
                    this.setState({
                        messages: [{
                            message: responseJson.error,
                            type: 'ERROR',
                        }]
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    messages: [GENERIC_API_ERROR]
                })
            });

    }

    resetPassword = () => {
        var uri = (this.state.userRole == USER_ROLE_APP_ADMIN ? '/appadmin' : '/vendoradmin') + '/generatePassword/' + this.state.id;

        //alert(uri);
        requestAPI('AppUserServiceURL', uri, 'GET')
            .then((response) => response.json() )
            .then((responseJson) => {
                if ( responseJson.messages ) {
                    //alert(JSON.stringify(responseJson));
                    this.setState ({
                        messages: responseJson.messages,
                    });
                    if ( responseJson.appUser ) {
                        alert("New Password: " + responseJson.appUser.password);
                    }
                } else if ( responseJson.error ) {
                    this.setState({
                        messages: [{
                            message: responseJson.error,
                            type: 'ERROR',
                        }]
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    messages: [GENERIC_API_ERROR]
                })
            });

    }

    retrieveAllVendors = () => {
        requestAPI('VendorServiceURL', '/appadmin/viewallvendors', 'GET')
            .then((response) => response.json())
            .then((responseJson) => {
                if ( responseJson.error ) {
                    this.setState({
                        messages: [{
                            message: responseJson.error,
                            type: 'ERROR',
                        }],
                        vendors: [],
                        loading: false,
                    });
                    AsyncStorage.removeItem('Vendors');
                } else {
                    this.setState({
                        vendors: responseJson,
                        loading: false,
                    });
                    AsyncStorage.setItem('Vendors', JSON.stringify(createVendorList(responseJson)));
                }
                //alert(JSON.stringify(responseJson));
            })
            .catch((error) => {
                //alert(JSON.stringify(error));
                this.setState({
                    messages: [GENERIC_API_ERROR],
                    loading: false,
                });
                AsyncStorage.removeItem('Vendors');
            });
    }

    showActionSheet = () => {
        //To show the Bottom ActionSheet
        this.ActionSheet.show();
    };

    performAction = (index) => {
        if ( index==0 ) {
            this.register();
        } else if ( index==1 ) {
            this.doActivate();
        } else if ( index==2 ) {
            this.resetPassword();
        } else if ( index==3 ) {
            this.props.navigation.navigate('History', { ...this.state} );
        }
    }

    // End Component functions


    render() {
        return (
            <View style={CommonStyle.mainContainer}>
                <View style={CommonStyle.parentContainer}>
                    <CustomValidationMessage message={this.state.messages} />
                    <ScrollView>
                        <TextField
                            label='Username'
                            editable={!this.state.updateMode}
                            value={this.state.username}
                            onChangeText={(value) => this.setState({username: value})}
                        />
                        <TextField
                            label='Name'
                            value={this.state.name}
                            onChangeText={(value) => this.setState({name: value})}
                        />
                        { this.state.userRole == USER_ROLE_APP_ADMIN &&
                            <Dropdown
                                label='Role'
                                data={this.roles}
                                value={this.state.role}
                                onChangeText={(value) => this.setState({role: value, objectRef: (value==USER_ROLE_APP_ADMIN ? '' :this.state.objectRef)})}
                            />
                        }
                        { this.state.userRole == USER_ROLE_APP_ADMIN && this.state.role != USER_ROLE_APP_ADMIN &&
                            <Dropdown
                                label='Vendor'
                                data={this.state.vendors}
                                value={this.state.objectRef}
                                onChangeText={(value) => this.setState({objectRef: value})}
                            />
                        }
                    </ScrollView>
                    <View style={styles.content_button}>
                        <CustomButton
                            visible={!this.state.updateMode}
                            primary={true}
                            label={"Register"}
                            width={300}
                            onPress={this.register} />
                        <CustomButton
                            visible={this.state.updateMode}
                            primary={true}
                            label={"Action"}
                            width={300}
                            onPress={this.showActionSheet} />
                        <ActionSheet
                            ref={o => (this.ActionSheet = o)}
                            //Title of the Bottom Sheet
                            title={'Please select action'}
                            //Options Array to show in bottom sheet
                            options={this.state.optionAction}
                            //Define cancel button index in the option array
                            //this will take the cancel option in bottom and will highlight it
                            cancelButtonIndex={4}
                            //If you want to highlight any specific option you can use below prop
                            destructiveButtonIndex={0}
                            onPress={index => this.performAction(index)}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create ({
    content_button: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
    },
})