import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-community/async-storage';
import base64 from 'react-native-base64'

import { MainAppContainer } from "../../config/router";
import { GENERIC_API_ERROR } from '../../config/messages';
import { onSignIn, onSignOut, isSignedIn, setUserRole, setVendorId, getPayload, USER_ROLE, VENDOR_ID } from "../../config/auth";
import Colors from '../../components/Colors';
import CommonStyle from '../../styles/styles';
import CustomValidationMessage from '../../components/CustomValidationMessage';
import { CustomButton } from '../../components/CommonComponent';

import ValidationScheme from '../../components/ValidationScheme';
import '../../components/ValidateWrapper';

import { requestAPIWoToken } from '../../components/RestAPI';

export default class screens extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Login: {
                username: '',
                password: '',
            },
            token: '',
            messages: [],
            animating: true,
        };
    }

    componentWillMount = () => {
        //alert(JSON.stringify(GENERIC_API_ERROR));
        this.setState({animating: false});

        AsyncStorage.getItem('AuthServiceURL').then(value => {
            //alert(value);
            if ( value==null || value=="") {
                this.setState({
                    messages: [{
                        message: 'Server connection is not yet configured. Please contact vendor administrator.',
                        type: 'WARNING',
                    }]
                });
            }
        });
    }

    setStateValue = (fieldName, value) => {
        this.state.Login[fieldName] = value.trim();
    }

    login = () => {

        if ( this.state.Login.username.toUpperCase() == "SETTING" ) {
            this.props.navigation.navigate('ConnectionSettings');
        } else {
            var errors = validateForm(this.state.Login, ValidationScheme.Login);
            this.setState({
                messages: convertValErrorToAppError(errors),
                animating: (!Array.isArray(errors) || !errors.length),
            });

            if (!Array.isArray(errors) || !errors.length) {
                //var sUserName = this.state.Login.username + ':VendorHub';

                this.setStateValue('username', this.state.Login.username + ':VendorHub');
                //alert(sUserName);
                //alert(JSON.stringify(this.state.Login));

                requestAPIWoToken('AuthServiceURL', '/auth', 'POST', this.state.Login)
                    .then((response) => {

                        var authorization = response.headers.map.authorization;
                        if ( authorization ) {
                            this.setState({
                                token: authorization,
                                animating: false
                            });
                            onSignIn(this.state.token);


                            getPayload()
                                .then(payload => {
                                    if ( payload.role=='APP_ADMIN' ) {
                                        this.props.navigation.navigate('Admin');
                                    } else if  ( payload.role=='VENDOR_ADMIN' ) {
                                        this.props.navigation.navigate('Vendor');
                                    } else if  ( payload.role=='VENDOR_USER' ) {
                                        this.props.navigation.navigate('User');
                                    }
                                })
                                .catch(err => alert(err));

                        } else {
                            this.setState({
                                token: '',
                                animating: false,
                                messages: [{
                                    message: 'Invalid credential.',
                                    type: 'ERROR',
                                }]
                            });
                        }
                    })
                    .catch((error) => {
                        this.setState({
                            messages: [GENERIC_API_ERROR],
                            animating: false,
                        }
                    )
                });
            }
        }

    }

    render() {
        return (
            <ImageBackground
                style={[styles.background, styles.container]}
                source={require('../../res/images/background.jpg')}
                resizeMode='cover'
            >
                <View style={styles.container} />
                    <View style={styles.wrapper}>
                        <ActivityIndicator
                            animating = {this.state.animating}
                            color = '#bc2b78'
                            size = "large"
                            style = {CommonStyle.activityIndicator}/>
                        <View style={styles.msgWrap}>
                            <CustomValidationMessage message={this.state.messages} />
                        </View>
                        <View style={styles.inputWrap}>
                            <View style={styles.iconWrap}>
                                <Feather name="user" size={20} color="#fff" style={styles.icon}  />
                            </View>
                            <TextInput
                                autoCapitalize="characters"
                                placeholder="Username"
                                style={CommonStyle.textInput}
                                underlineColorAndroid="transparent"
                                onChangeText={(value) => this.setStateValue('username', value)}
                            />
                        </View>
                        <View style={styles.inputWrap}>
                            <View style={styles.iconWrap}>
                                <Feather name="lock" size={20} color="#fff" style={styles.icon}  />
                            </View>
                            <TextInput
                                placeholder="Password"
                                secureTextEntry
                                style={CommonStyle.textInput}
                                underlineColorAndroid="transparent"
                                onChangeText={(value) => this.setStateValue('password', value)}
                            />
                        </View>
                        <View style={CommonStyle.buttonContainer}>
                            <CustomButton visible={true}
                                primary={true}
                                width={300}
                                label='Log In' onPress={this.login}/>
                        </View>
                    </View>
                <View style={styles.container} />
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        width: null,
        height: null
    },
    wrapper: {
        paddingHorizontal: 15,
    },
    msgWrap: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    inputWrap: {
        flexDirection: "row",
        marginVertical: 10,
        height: 40,
        backgroundColor: "transparent",
    },
    iconWrap: {
        paddingHorizontal: 7,
        alignItems: "center",
        justifyContent: "center",
        //backgroundColor: "#d73352",
        backgroundColor: Colors.purple,
    },
    icon: {
        width: 20,
        height: 20,
    },
    forgotPasswordText: {
        color: "#FFF",
        backgroundColor: "transparent",
        textAlign: "center"
    }
});