import React, { Component } from 'react';
import { View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    } from 'react-native';
import { Tile, Avatar } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';
import ActionSheet from 'react-native-actionsheet';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker'
import AntDesign from 'react-native-vector-icons/AntDesign';

import { getToken, getPayload } from "../../config/auth";
import { requestAPI, requestAPIDirect } from '../../components/RestAPI';
import { GENERIC_API_ERROR } from '../../config/messages';
import { CustomButton } from '../../components/CommonComponent';

import Colors from '../../components/Colors';
import CommonStyle from '../../styles/styles';
import CustomValidationMessage from '../../components/CustomValidationMessage';
import ValidationScheme from '../../components/ValidationScheme';
import '../../components/ValidateWrapper';

import { toUpperCase } from "../../utils/Util";

export default class extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            objectType: 'Product',
            id: '',
            name: '',
            group: '',
            imgLocation: '',
            prodComp: {},
            prodCompBasePrice: '',
            prodCompQuantity: '1',
            prodCompFeatureDiscount: '0%',
            activeIndicator: false,
            updateMode: false,
            messages: [],
            prodGroup: [],
            uploadingImage: false,
            optionAction: [],
        };

        this.uploadFile = this.uploadFile.bind(this);

    }

    componentWillMount = () => {

        if (this.props.navigation.state.params) {
            const { id, name, group, imgLocation, activeIndicator, prodComp } = this.props.navigation.state.params;

            //alert(JSON.stringify(this.props.navigation.state.params));
            this.setState({
                id: id,
                name: name,
                group: group,
                imgLocation: imgLocation,
                activeIndicator: activeIndicator,
                prodComp: prodComp,
                prodCompBasePrice: prodComp.basePrice.toString(),
                prodCompQuantity: prodComp.quantity.toString(),
                prodCompFeatureDiscount: ( prodComp.features[0] && prodComp.features[0].value ? prodComp.features[0].value.toString() : '0'),
                updateMode: true,
                optionAction: [
                    'Save',
                    (activeIndicator ? 'Deactivate' : 'Activate'),
                    'Show History',
                    'Cancel',
                ],
            });

        }

        this.fetchProdGroup();

    }
    // End Components triggers


    // Start Component functions

    fetchProdGroup = () => {

        AsyncStorage.getItem('ProdGroup').then(prodGroup => {

            if ( prodGroup ) {
                this.setState({
                    prodGroup: JSON.parse(prodGroup),
                });
                this.displayProductGroupError(JSON.parse(prodGroup));
            } else {
                requestAPI('ConfigServiceURL', '/vendoradmin/viewreferencedatabygroup/ProductGroup', 'GET')
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if ( responseJson.error ) {
                            this.setState({
                                messages: [{
                                    message: responseJson.error,
                                    type: 'ERROR',
                                }],
                                prodGroup: [],
                                loading: false,
                            });
                            AsyncStorage.removeItem('ProdGroup');
                        } else {
                            this.setState({
                                prodGroup: responseJson,
                                loading: false,
                            });
                            AsyncStorage.setItem('ProdGroup', JSON.stringify(responseJson));

                            this.displayProductGroupError(responseJson);

                        }
                        //alert(JSON.stringify(responseJson));
                    })
                    .catch((error) => {
                        //alert(error);
                        this.setState({
                            messages: [GENERIC_API_ERROR],
                            loading: false,
                        });
                        AsyncStorage.removeItem('ProdGroup');
                    });
            }

        })

    }

    displayProductGroupError = (prodGroup) => {

        // If no Product Group declared yet, display error
        if ( prodGroup && prodGroup.length == 0 ) {
            this.setState({
                messages: [{
                    message: 'Product Group is not yet configured. Define it first under Reference menu before creating a product.',
                    type: 'ERROR',
                }],
                loading: false,
           });
        }
    }

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

                //alert(JSON.stringify(data));

                AsyncStorage.getItem('CloudinaryProductURL').then(serviceURL => {
                    var jsonService = JSON.parse(serviceURL);

                    requestAPIDirect(jsonService.externalService, 'POST', '', data)
                        .then(response => response.json())
                        .then(result => {
                            //alert(JSON.stringify(result));
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

        var feature = {};
        if ( this.state.prodCompFeatureDiscount ) {
            //var discount = this.state.prodCompFeatureDiscount.replace('%','');
            feature = {
                name: 'Discount',
                value: this.state.prodCompFeatureDiscount,
            }
        }

        var tempProdComp = {
            name: this.state.name,
            basePrice: this.state.prodCompBasePrice,
            quantity: 1,
            features: [feature],
        }

        var ProductRegistration = {
            id: this.state.id,
            name: this.state.name,
            group: this.state.group,
            imgLocation: this.state.imgLocation,
            activeIndicator: this.state.activeIndicator,
            prodComp: tempProdComp,
            prodCompFeatureDiscount: this.state.prodCompFeatureDiscount,
        }

        var errors = validateForm(ProductRegistration, ValidationScheme.ProductRegistration);
        this.setState({messages: convertValErrorToAppError(errors)});

        if (!Array.isArray(errors) || !errors.length) {

            var uri = this.state.updateMode ? '/vendoradmin/updateproduct' : '/vendoradmin/createproduct';
            requestAPI('ProductServiceURL', uri, 'POST', ProductRegistration)
                .then((response) => response.json() )
                .then((responseJson) => {
                    //alert(JSON.stringify(responseJson));
                    if ( responseJson.messages ) {
                        this.setState ({
                            messages: responseJson.messages,
                        });
                        if ( responseJson.product ) {
                            this.setState({
                                id: responseJson.product.id,
                                name: responseJson.product.name,
                                group: responseJson.product.group,
                                imgLocation: responseJson.product.imgLocation,
                                activeIndicator: responseJson.product.activeIndicator,
                                prodComp: responseJson.product.prodComp,
                                prodCompBasePrice: responseJson.product.prodComp.basePrice.toString(),
                                prodCompQuantity: responseJson.product.prodComp.quantity.toString(),
                                prodCompFeatureDiscount: ( responseJson.product.prodComp.features[0] && responseJson.product.prodComp.features[0].value ? responseJson.product.prodComp.features[0].value.toString(): '0'),
                                updateMode: true,
                                optionAction: [
                                   'Save',
                                   (responseJson.product.activeIndicator ? 'Deactivate' : 'Activate'),
                                    'Show History',
                                   'Cancel',
                                ],
                            });
                        }
                        AsyncStorage.removeItem('ProdGroups');
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
                    //alert(error);
                    this.setState({
                        messages: [GENERIC_API_ERROR]
                    })
                });
        }
    }

    doActivate = () => {

        var uri = (this.state.activeIndicator ? '/vendoradmin/deactivateproduct/' : '/vendoradmin/activateproduct/') + this.state.id;

        requestAPI('ProductServiceURL', uri, 'GET')
            .then((response) => response.json() )
            .then((responseJson) => {
                //alert(JSON.stringify(responseJson));
                if ( responseJson.messages ) {
                    this.setState ({
                        messages: responseJson.messages,
                    });
                    if ( responseJson.product ) {
                        this.setState({
                            activeIndicator: responseJson.product.activeIndicator,
                            optionAction: [
                                'Save',
                                (responseJson.product.activeIndicator ? 'Deactivate' : 'Activate'),
                                'Cancel',
                            ]
                        });
                    }
                    AsyncStorage.removeItem('ProdGroups');
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

    // End Component functions

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
                                    source={{ uri: this.state.imgLocation ? this.state.imgLocation : "https://res.cloudinary.com/ckidtech/image/upload/v1562740824/quotation-product/noimage.jpg"}}
                                    showEditButton
                                    onPress={this.uploadFile}
                                />
                            </TouchableOpacity>
                        </View>
                        <Dropdown
                            label='Product Group'
                            data={this.state.prodGroup}
                            value={this.state.group}
                            onChangeText={(value) => this.setState({'group': value})}
                        />
                        <TextField
                            label='Product Name'
                            value={this.state.name}
                            onChangeText={(value) => this.setState({'name': value})}
                        />
                        <TextField
                            label='Base Price'
                            value={this.state.prodCompBasePrice}
                            onChangeText={(value) => this.setState({'prodCompBasePrice': value})}
                        />
                        <TextField
                            label='Promotional Discount'
                            value={this.state.prodCompFeatureDiscount}
                            onChangeText={(value) => this.setState({'prodCompFeatureDiscount': value})}
                        />
                    </ScrollView>
                    <View style={styles.content_button}>
                        <CustomButton
                            visible={!this.state.updateMode}
                            primary={true}
                            label={"Register"}
                            width={this.state.updateMode ? 150 : 300}
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

const styles = StyleSheet.create ({
    content_button: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
    },
})