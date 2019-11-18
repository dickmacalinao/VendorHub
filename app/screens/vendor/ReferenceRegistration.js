import React, { Component } from 'react';
import { View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    } from 'react-native';
import { Tile } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker'

import { getToken, getPayload } from "../../config/auth";
import { requestAPI } from '../../components/RestAPI';

import CustomValidationMessage from '../../components/CustomValidationMessage';
import ValidationScheme from '../../components/ValidationScheme';
import { CustomButton } from '../../components/CommonComponent';
import '../../components/ValidateWrapper';

import { GENERIC_API_ERROR } from '../../config/messages';

import Colors from '../../components/Colors';
import CommonStyle from '../../styles/styles';

export default class extends Component {

    // Start Components triggers
    constructor(props) {
        super(props)
        this.state = {
            grantTo: '',
            refGroup: '',
            id: '',
            name: '',
            value: '',
            vendorId: '',
            updateMode: false,
            messages: [],
        }

    }

    componentWillMount = () => {

        getPayload()
            .then(payload => {
                if (this.props.navigation.state.params) {
                    const { grantTo, refGroup, id, name, value } = this.props.navigation.state.params;
                    this.setState({
                        vendorId: payload.objectRef,
                        grantTo: grantTo,
                        refGroup: refGroup,
                        id: id,
                        name: name,
                        value: value,
                        updateMode: true,
                    })
                    //alert(JSON.stringify(this.props.navigation.state.params));
                } else {
                    this.setState({grantTo: payload.objectRef});
                }
            });


    }
    // End Components triggers

    register = () => {

        var ReferenceRegistration = {
            id: this.state.id,
            grantTo: this.state.grantTo,
            refGroup: this.state.refGroup,
            name: (this.state.refGroup=='ProductGroup' ? this.state.value : this.state.name),
            value: this.state.value,
        }

        var errors = validateForm(ReferenceRegistration, ValidationScheme.ReferenceRegistration);
        this.setState({messages: convertValErrorToAppError(errors)});

        if (!Array.isArray(errors) || !errors.length) {

            var uri = this.state.updateMode ? '/vendoradmin/updatereferencedata' : '/vendoradmin/createreferencedata';

            requestAPI('ConfigServiceURL', uri, 'POST', ReferenceRegistration)
                .then((response) => response.json() )
                .then((responseJson) => {
                    //alert(JSON.stringify(responseJson));
                    if ( responseJson.messages ) {
                        this.setState ({
                            messages: responseJson.messages,
                        });
                        if ( responseJson.referenceData ) {
                            this.setState ({
                                grantTo: responseJson.referenceData.grantTo,
                                refGroup: responseJson.referenceData.refGroup,
                                id: responseJson.referenceData.id,
                                name: responseJson.referenceData.name,
                                value: responseJson.referenceData.value,
                                updateMode: true,
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
                    //alert(error);
                    this.setState({
                        messages: [GENERIC_API_ERROR]
                    })
                });

        }
    }

    render() {
        return (
            <View style={styles.parentContainer}>
                <View>
                    <CustomValidationMessage message={this.state.messages} />
                </View>
                <ScrollView>
                    <Dropdown
                        label='Reference Group'
                        data={[
                            {value: 'ProductGroup', label: 'Product Group'},
                            {value: 'Discount', label: 'Discount'}
                        ]}
                        value={this.state.refGroup}
                        onChangeText={value => this.setState({'refGroup': value})}
                    />
                    {this.state.refGroup!='ProductGroup' &&
                        <TextField
                            label='Name'
                            value={this.state.name}
                            onChangeText={value => this.setState({'name': value})}
                        />
                    }
                    <TextField
                        label='Value'
                        value={this.state.value}
                        onChangeText={value => this.setState({'value': value})}
                    />
                </ScrollView>
                <View style={{justifyContent: 'center', alignItems: 'center',}}>
                    <CustomButton
                        visible={true}
                        primary={true}
                        label={this.state.updateMode ? "Save" : "Register"}
                        width={300}
                        onPress={this.register}/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create ({
    parentContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        margin: 10,
    },
})