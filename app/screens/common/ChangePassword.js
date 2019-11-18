import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextField } from 'react-native-material-textfield';

import CustomValidationMessage from '../../components/CustomValidationMessage';
import ValidationScheme from '../../components/ValidationScheme';
import '../../components/ValidateWrapper';
import { GENERIC_API_ERROR } from '../../config/messages';
import { CustomButton } from '../../components/CommonComponent';

import { getPayload } from "../../config/auth";
import { USER_ROLE_APP_ADMIN, USER_ROLE_VENDOR_ADMIN, USER_ROLE_VENDOR_USER } from "../../config/constant";
import { requestAPI } from '../../components/RestAPI';

import CommonStyle from '../../styles/styles';

export default class extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);

        this.state = {
            newPassword: '',
            role: '',
            messages: [],
        }
    }

    componentWillMount = () => {

        getPayload()
            .then(payload => {
                this.setState({
                    role: payload.role,
                });
            });
    }
    // End Components triggers

    changePassword = () => {

        var errors = validateForm(this.state, ValidationScheme.ChangePassword);
        this.setState({messages: convertValErrorToAppError(errors)});

        if (!Array.isArray(errors) || !errors.length) {

            var uri = "";
            if ( this.state.role == USER_ROLE_APP_ADMIN ) {
                uri = '/appadmin/changepassword/oldpassword/' + this.state.newPassword;
            } else if ( this.state.role == USER_ROLE_VENDOR_ADMIN ) {
                uri = '/vendoradmin/changepassword/oldpassword/' + this.state.newPassword;
            } else {
                uri = '/vendoruser/changepassword/oldpassword/' + this.state.newPassword;
            }

            //alert(this.state.role + uri);

            requestAPI('AppUserServiceURL', uri, 'GET')
                .then((response) => response.json() )
                .then((responseJson) => {
                    if ( responseJson.messages ) {
                        this.setState ({
                            messages: responseJson.messages,
                        });
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

    render() {
        return (
            <View style={CommonStyle.mainContainer}>
                <View style={CommonStyle.parentContainer}>
                    <CustomValidationMessage message={this.state.messages} />
                    <TextField
                        label='New Password'
                        secureTextEntry
                        value={this.state.newPassword}
                        onChangeText={(value) => this.setState({newPassword: value})}
                    />
                </View>
                <View style={styles.content_button}>
                    <CustomButton visible={true}
                        primary={true}
                        label={"Change Password"}
                        width={300}
                        onPress={this.changePassword}/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content_button: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
    },
});
