import React, { Component } from 'react';
import { View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    } from 'react-native';
import {  Avatar } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import ImagePicker from 'react-native-image-picker'
import ActionSheet from 'react-native-actionsheet';
import AsyncStorage from '@react-native-community/async-storage';

import { requestAPI, requestAPIDirect } from '../../components/RestAPI';
import { CustomButton, NumericField } from '../../components/CommonComponent';
import CustomValidationMessage from '../../components/CustomValidationMessage';
import ValidationScheme from '../../components/ValidationScheme';
import '../../components/ValidateWrapper';
import { GENERIC_API_ERROR } from '../../config/messages';

import Colors from '../../components/Colors';
import CommonStyle from '../../styles/styles';

export default class extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            objectType: 'Vendor',
            id: '',
            name: '',
            imgLocation: '',
            activeIndicator: false,
            maxSearchResult: 0,
            maxUserAllowed: 0,
            maxProductAllowed: 0,
            VendorRegistration: {},
            updateMode: false,
            messages: [],
            uploadingImage: false,
            optionAction: [],
        }
        this.uploadFile = this.uploadFile.bind(this)

    }

    componentWillMount = () => {

        if (this.props.navigation.state.params) {
            const { id, name, imgLocation, maxSearchResult, maxUserAllowed, maxProductAllowed, activeIndicator } = this.props.navigation.state.params;
            this.setState({
                id: id,
                name: name,
                imgLocation: imgLocation,
                maxSearchResult: maxSearchResult,
                maxUserAllowed: maxUserAllowed,
                maxProductAllowed: maxProductAllowed,
                activeIndicator: activeIndicator,
                updateMode: true,
                optionAction: [
                    'Save',
                    (activeIndicator ? 'Deactivate' : 'Activate'),
                    'Show History',
                    'Cancel',
                ],
            });
        }
    }
    // End Components triggers

    uploadFile () {
        var options = {
            title: 'Select a file',
            noData: true,
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        ImagePicker.showImagePicker(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {

                this.setState({
                    uploadingImg: true
                });

                const data = new FormData();

                data.append('file', {
                    uri: response.uri,
                    type: response.type,
                    name: response.fileName,
                });

                AsyncStorage.getItem('CloudinaryVendorURL').then(serviceURL => {

                    var jsonService = JSON.parse(serviceURL);
                    requestAPIDirect(jsonService.externalService, 'POST', '', data)
                        .then(response => response.json())
                        .then(result => {
                            if ( result.error ) {
                                this.setState({
                                    messages: [{
                                        message: result.error.message,
                                        type: 'ERROR',
                                    }]
                                })
                            } else {
                                this.setState({
                                    imgLocation: result.secure_url,
                                    uploadingImg: false,
                                });
                            }
                            //alert(JSON.stringify(result));

                        })
                        .catch(error => {
                            this.setState({
                                messages: [GENERIC_API_ERROR],
                                loading: false,
                            })
                        })

                });

            }
        });
    }

    register = () => {

        this.state.VendorRegistration['id'] = this.state.id;
        this.state.VendorRegistration['name'] = this.state.name;
        this.state.VendorRegistration['maxSearchResult'] = this.state.maxSearchResult;
        this.state.VendorRegistration['maxUserAllowed'] = this.state.maxUserAllowed;
        this.state.VendorRegistration['maxProductAllowed'] = this.state.maxProductAllowed;
        this.state.VendorRegistration['activeIndicator'] = this.state.activeIndicator;
        this.state.VendorRegistration['imgLocation'] = this.state.imgLocation;

        var errors = validateForm(this.state.VendorRegistration, ValidationScheme.VendorRegistration);
        this.setState({messages: convertValErrorToAppError(errors)});

        if (!Array.isArray(errors) || !errors.length) {

            var uri = this.state.updateMode ? '/appadmin/updatevendor' : '/appadmin/createvendor';
            requestAPI('VendorServiceURL', uri, 'POST', this.state.VendorRegistration)
                .then((response) => response.json() )
                .then((responseJson) => {
                    //alert(JSON.stringify(responseJson));
                    if ( responseJson.messages ) {
                        this.setState ({
                            messages: responseJson.messages,
                        });

                        if ( responseJson.vendor ) {
                            this.setState ({
                                id: responseJson.vendor.id,
                                name: responseJson.vendor.name,
                                imgLocation: responseJson.vendor.imgLocation,
                                maxSearchResult: responseJson.vendor.maxSearchResult,
                                maxUserAllowed: responseJson.vendor.maxUserAllowed,
                                maxProductAllowed: responseJson.vendor.maxProductAllowed,
                                activeIndicator: responseJson.vendor.activeIndicator,
                                updateMode: true,
                                optionAction: [
                                    'Save',
                                    (responseJson.vendor.activeIndicator ? 'Deactivate' : 'Activate'),
                                    'Show History',
                                    'Cancel',
                                ],
                            });
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
                    alert(error);
                    this.setState({
                        messages: [GENERIC_API_ERROR],
                    })
                });

        }
    }

    doActivate = () => {

        var uri = (this.state.activeIndicator ? '/appadmin/deactivatevendor/' : '/appadmin/activatevendor/') + this.state.id;

        requestAPI('VendorServiceURL', uri, 'GET')
            .then((response) => response.json() )
            .then((responseJson) => {
                if ( responseJson.messages ) {
                    //alert(JSON.stringify(responseJson));
                    this.setState ({
                        messages: responseJson.messages,
                    });
                    if ( responseJson.vendor ) {
                        this.setState({
                            activeIndicator: responseJson.vendor.activeIndicator,
                            optionAction: [
                                'Save',
                                (responseJson.vendor.activeIndicator ? 'Deactivate' : 'Activate'),
                                'Show History',
                                'Cancel',
                            ]
                        });
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
            this.props.navigation.navigate('History', { ...this.state} );
        }
    }

    render() {
        return (
            <View style={CommonStyle.mainContainer}>
                <View style={CommonStyle.parentContainer}>
                    <CustomValidationMessage message={this.state.messages} />
                    <ScrollView>
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} >
                            <TouchableOpacity>
                                <Avatar
                                    rounded
                                    size="xlarge"
                                    activeOpacity={0.7}
                                    source={{ uri: this.state.imgLocation ? this.state.imgLocation : "https://res.cloudinary.com/ckidtech/image/upload/v1562225315/quotation-vendor/default_vendor.jpg" }}
                                    showEditButton
                                    onPress={this.uploadFile}
                                />
                            </TouchableOpacity>
                        </View>
                        <TextField
                            label='Name'
                            value={this.state.name}
                            onChangeText={(value) => this.setState({name: value})}
                        />
                        <NumericField
                            label='Max Search Result'
                            value={this.state.maxSearchResult}
                            visible={true}
                            onChange={value => this.setState({maxSearchResult: value})}
                        />
                        <NumericField
                            label='Max User Allowed'
                            value={this.state.maxUserAllowed}
                            visible={true}
                            onChange={value => this.setState({maxUserAllowed: value})}
                        />
                        <NumericField
                            label='Max Product Allowed'
                            value={this.state.maxProductAllowed}
                            visible={true}
                            onChange={value => this.setState({maxProductAllowed: value})}
                        />
                    </ScrollView>
                    <View style={{justifyContent: 'center', alignItems: 'center',}}>
                        <CustomButton
                            visible={!this.state.updateMode}
                            primary={true}
                            label={"Register"}
                            width={300}
                            onPress={this.register}/>
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
                            cancelButtonIndex={3}
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
