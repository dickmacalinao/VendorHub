import React, { Component } from 'react';
import { View,
    ScrollView,
    SectionList,
    TextInput,
    StyleSheet,
    Image,
    Text,
    TouchableOpacity
    } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import AsyncStorage from '@react-native-community/async-storage';

import CustomValidationMessage from '../../components/CustomValidationMessage';
import { CustomButton } from '../../components/CommonComponent';

import Colors from '../../components/Colors';
import Connections from '../../config/conn';

export default class extends Component {

    // Start Components triggers
    constructor(props) {
        super(props)
        this.state = {
            connections: [],
            SelectedServiceURL: '',
            messages: [],
        }

    }

    // Load Settings Dropdown values
    componentDidMount = () => {

        //alert(JSON.stringify(Connections));

        // Get Default value for Environment
        AsyncStorage.getItem('ServiceURL').then(value => {
            this.setState({SelectedServiceURL: value});
            //alert(value);
        });

    }

    // End Components triggers

    // Save to Asynchronous the selected setting
    saveSetting = () => {

        AsyncStorage.setItem('ServiceURL', this.state.SelectedServiceURL);

        for (var index in Connections) {
            if ( this.state.SelectedServiceURL == Connections[index].value ) {
                var services = Connections[index].services;
                //alert(JSON.stringify(services));
                for (var ind in services) {
                    if ( services[ind].id == 'AuthServiceURL' ) {
                        AsyncStorage.setItem('AuthServiceURL', JSON.stringify(services[ind]));
                    } else if ( services[ind].id == 'ConfigServiceURL' ) {
                        AsyncStorage.setItem('ConfigServiceURL', JSON.stringify(services[ind]));
                    } else if ( services[ind].id == 'AppUserServiceURL' ) {
                        AsyncStorage.setItem('AppUserServiceURL', JSON.stringify(services[ind]));
                    } else if ( services[ind].id == 'VendorServiceURL' ) {
                        AsyncStorage.setItem('VendorServiceURL', JSON.stringify(services[ind]));
                    } else if ( services[ind].id == 'ProductServiceURL' ) {
                        AsyncStorage.setItem('ProductServiceURL', JSON.stringify(services[ind]));
                    } else if ( services[ind].id == 'OrderServiceURL' ) {
                        AsyncStorage.setItem('OrderServiceURL', JSON.stringify(services[ind]));
                    } else if ( services[ind].id == 'CloudinaryVendor' ) {
                        AsyncStorage.setItem('CloudinaryVendorURL', JSON.stringify(services[ind]));
                    } else if ( services[ind].id == 'CloudinaryProduct' ) {
                        AsyncStorage.setItem('CloudinaryProductURL', JSON.stringify(services[ind]));
                    }
                }
            }
        }

    }

    render () {
        return (
            <View style={styles.parentContainer}>
                <CustomValidationMessage message={this.state.messages} />
                <ScrollView>
                    <Dropdown
                        label='Backend Service'
                        containerStyle={styles.dropDownStyle}
                        data={Connections}
                        value={this.state.SelectedServiceURL}
                        onChangeText={ (value) => this.setState({SelectedServiceURL: value}) } />
                </ScrollView>
                <View style={{justifyContent: 'center', alignItems: 'center',}}>
                    <CustomButton
                        visible={true}
                        primary={true}
                        label={"Save"}
                        width={300}
                        onPress={this.saveSetting}/>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create ({
    parentContainer: {
        flex: 1,
        flexDirection: 'column',
        margin: 10,
    },
    dropDownStyle: {
        flex:1,
        alignItems: 'stretch'
    },
})