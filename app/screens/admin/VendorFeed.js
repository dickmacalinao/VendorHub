import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    FlatList
    } from 'react-native';
import { ListItem, SearchBar, Avatar } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import { withNavigationFocus } from "react-navigation";

import { getToken } from "../../config/auth";
import { GENERIC_API_ERROR } from '../../config/messages';
import { requestAPI } from '../../components/RestAPI';
import { listEmpty, flatListSeparator } from "../../components/ListCommonComponent";
import CustomValidationMessage from '../../components/CustomValidationMessage';
import Colors from '../../components/Colors';

import { createVendorList } from "../../utils/AppUtil";
import CommonStyle from '../../styles/styles';
import ListStyle from '../../styles/styles-list';

class VendorFeed extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            vendors: [],
            messages: [],
        }
    }

    componentWillMount = () => {
        this.retrieveAllVendors();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused && this.props.isFocused) {
            this.retrieveAllVendors();
        }
    }

    // End Components triggers


    // Start Components functions
    retrieveAllVendors = () => {

        this.setState({
            messages: [],
            loading: true,
        });

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

    goToDetailScreen = (vendor) => {
        //alert(vendor.id);
        this.props.navigation.navigate('VendorRegistration', { ...vendor} );
    }

    goToVendorReg = () => {
        this.props.navigation.navigate('VendorRegistration');
    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    backgroundColor: '#CED0CE',
                }}
            />
        );
    };
    // End Components functions

    render () {
        return (
            <View style={ListStyle.parentContainer}>
                <CustomValidationMessage message={this.state.messages} />
                <FlatList
                    data={this.state.vendors}
                    keyExtractor={(item, index) => item + index}
                    ItemSeparatorComponent={this.renderSeparator}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={this.goToDetailScreen.bind(this, item)} >
                            <View style={{ flex: 1, flexDirection:'column'}}>
                                <View style={styles.VendorItem}>
                                    <Avatar
                                        rounded
                                        size="large"
                                        activeOpacity={0.7}
                                        source={{ uri: item.imgLocation ? item.imgLocation : "https://res.cloudinary.com/ckidtech/image/upload/v1562225315/quotation-vendor/default_vendor.jpg" }}
                                    />
                                    <View style={{
                                            flex: 1,
                                            flexDirection:'column',
                                            height: 50,
                                        }}>
                                            <Text style={ListStyle.listTextBold}>{item.name}</Text>
                                            <Text style={ListStyle.listText}>{item.id + (item.activeIndicator ? '' : ' (inactive)')}</Text>
                                    </View>
                                </View>
                                <View style={{
                                    height: 1,
                                    backgroundColor:'white'
                                }}>
                                </View>
                            </View>
                        </TouchableOpacity >
                    )}
                />
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.goToVendorReg}
                    style={CommonStyle.AddButton}>
                    <Image
                        //We are making FAB using TouchableOpacity with an image
                        //We are using online image here
                         source={require('../../res/icons/add_icon.png')}
                        //You can use you project image Example below
                        //source={require('./images/float-add-icon.png')}
                        style={CommonStyle.FloatingButtonStyle}/>
                </TouchableOpacity>
            </View>
        );
    }
}

export default withNavigationFocus(VendorFeed);

const styles = StyleSheet.create ({
    VendorItem: {
        flex: 1,
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
    }
})