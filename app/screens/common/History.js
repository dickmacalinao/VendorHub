import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Moment from 'moment';

import { USER_ROLE_APP_ADMIN, USER_ROLE_VENDOR_ADMIN, USER_ROLE_VENDOR_USER } from "../../config/constant";
import { flatListSeparator } from "../../components/ListCommonComponent";
import { getPayload } from "../../config/auth";
import { requestAPI } from '../../components/RestAPI';
import { GENERIC_API_ERROR } from '../../config/messages';

import ListStyle from '../../styles/styles-list';

class History extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        }
    }

    componentWillMount = () => {
        if (this.props.navigation.state.params) {
            //alert(JSON.stringify(this.props.navigation.state.params))
            const { objectType, id } = this.props.navigation.state.params;
            this.fetchObjectHistory(objectType, id);
        }
    }
    // End Components triggers

    fetchObjectHistory = (objectType, id) => {

        getPayload()
            .then(payload => {
                var serviceURL = '';
                var uri = '';
                if ( payload && objectType=='Vendor' )  {
                    serviceURL = 'VendorServiceURL';
                    uri = '/appadmin/getvendorbyid/' + id;
                } else if ( payload && objectType=='AppUser' )  {
                    serviceURL = 'AppUserServiceURL';
                    if ( payload.role==USER_ROLE_APP_ADMIN ) {
                        uri = '/appadmin/getappuserbyid/' + id;
                    } else if ( payload.role==USER_ROLE_VENDOR_ADMIN ) {
                        uri = '/vendoradmin/getappuserbyid/' + id;
                    }
                } else if ( payload && objectType=='Product' ) {
                    serviceURL = 'ProductServiceURL';
                    uri = '/vendoradmin/getvendorproductbyid/' + id;
                } else if ( payload && objectType=='Order' ) {
                    serviceURL = 'OrderServiceURL';
                    uri = '/vendoradmin/getorderbyid/' + id;
                }

                //alert(serviceURL + "/" + uri);

                if ( serviceURL!='' && uri!='' ) {
                    requestAPI(serviceURL, uri, 'GET')
                        .then((response) => response.json())
                        .then((responseJson) => {
                            if ( responseJson.error ) {
                                this.setState({
                                    messages: [{
                                        message: responseJson.error,
                                        type: 'ERROR',
                                    }],
                                    loading: false,
                                });
                            } else {
                                this.setState({
                                    data: responseJson.histories,
                                    loading: false,
                                });
                            }
                            //alert(JSON.stringify(responseJson.histories));
                        })
                        .catch((error) => {
                            //alert(error);
                            this.setState({
                                messages: [GENERIC_API_ERROR],
                                loading: false,
                            });
                        });
                }


            });

    }

    render() {
        return (
            <View style={ListStyle.parentContainer}>
                <FlatList
                    data={this.state.data}
                    keyExtractor={(item, index) => item + index}
                    ItemSeparatorComponent={flatListSeparator}
                    renderItem={({ item, index }) => (
                        <View style={{ flex: 1, flexDirection: 'column', marginLeft: 0}}>
                            <Text style={ListStyle.listTextBold}>{item.modifiedBy}</Text>
                            <Text style={ListStyle.listText}>{Moment(item.modifiedDate).format('YYYY/MM/DD HH:mm:ss')}</Text>
                            <Text style={ListStyle.listText}>{item.remark}</Text>
                        </View>
                    )}
                />
            </View>
        );
    }
}

export default History;

const styles = StyleSheet.create({
});
