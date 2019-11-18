import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
	Dimensions,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator
    } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { withNavigationFocus } from "react-navigation";

import { validateIfStillAuthorized } from "../../config/auth";
import { requestAPI } from '../../components/RestAPI';
import { listEmpty, flatListSeparator } from "../../components/ListCommonComponent";
import { CustomButton } from '../../components/CommonComponent';
import { formatMoney } from "../../components/Accounting";

import { GENERIC_API_ERROR } from '../../config/messages';
import CustomValidationMessage from '../../components/CustomValidationMessage';

import Colors from '../../components/Colors';
import CommonStyle from '../../styles/styles';
import ListStyle from '../../styles/styles-list';

class OrderList extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            filters: {
                dateFrom: moment(new Date()).format('YYYY-MM-DD'),
                dateTo: moment(new Date()).format('YYYY-MM-DD'),
                status: '',
                userId: '',
            },
            role: '',
            loading: false,
            orderList: [],
            totalAmount: 0,
            messages: [],
            COL_WIDTH_SEQ: 2/10,
            COL_WIDTH_ORDER: 5/10,
            COL_WIDTH_AMOUNT: 3/10,
        }

    }

    componentWillMount = () => {
        if (this.props.navigation.state.params) {
            this.setState({
                filters: this.props.navigation.state.params,
            });
            this.fetchData(this.props.navigation.state.params);
        } else {
            this.fetchData(this.state.filters);
        }

        this.getAppUserList();

    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused && this.props.isFocused) {
            //this.fetchData();
        }
    }

    onLayout(e) {
        const {width, height} = Dimensions.get('window')
        console.log(width, height)
        this.setState({
            orientation: (height>width ? 'portrait' : 'landscape'),
        });
    }

    // End Components triggers


    // Start Flat List functions

    flatListHeader = () => {
        return (
            <View style={ListStyle.flatlist_header_group}>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_SEQ }]}>Seq./Ref.</Text>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_ORDER }]}>Order</Text>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_AMOUNT }, ListStyle.align_right,]}>Amount</Text>
            </View>
        );
    };

    flatListFooter = () => {
        return (
            <View style={[ListStyle.flatlist_footer_group, {flexDirection: 'row-reverse', padding: 1}]}>
                <Text style={[ListStyle.flatlist_footer_text, ListStyle.align_right, ]}>
                    Total: {formatMoney(this.state.totalAmount, "Php ", 2, ",", ".")}
                </Text>
            </View>
        );
    };
    // End Flat List functions


    // Start Component functions

    // Show Order detail
    goToDetailScreen = (order) => {
        this.props.navigation.navigate('OrderItem', { ...order} );
    }

    // Refresh list
    refreshList = () => {
        this.fetchData();
    }

    getAppUserList = () => {

        AsyncStorage.getItem('AppUserList').then(appUserList => {

            if ( appUserList==null ) {

                var uri =  '/vendoradmin/findallappusers';
                requestAPI('AppUserServiceURL', uri, 'GET')
                    .then((response) => response.json())
                    .then((responseJson) => {

                        if ( validateIfStillAuthorized(this.props.navigation, responseJson.status) ) {
                            if ( responseJson.error ) {
                                this.setState({
                                    messages: [{
                                        message: responseJson.error,
                                        type: 'ERROR',
                                    }],
                                });
                                AsyncStorage.removeItem('AppUserList');
                            } else {
                                var userList = this.convertObjToAppUserList(responseJson);
                                AsyncStorage.setItem('AppUserList', JSON.stringify(userList));
                            }
                        }
                        //alert(JSON.stringify(responseJson));
                    })
                    .catch((error) => {
                        this.setState({
                            messages: [GENERIC_API_ERROR],
                        });
                        AsyncStorage.removeItem('AppUserList');
                    });

            }

        });

    }


    convertObjToAppUserList = (jsonData) => {
        var oList = []
        var oListData = {};
        for (var i = 0; i < jsonData.length; i++) {
            oListData = {};
            oListData.value = jsonData[i].username;
            oListData.label = jsonData[i].username + ( jsonData[i].activeIndicator==false ? ' - inactive' : '');
            oList.push(oListData);
        }
        return oList;
    }

    // Call API
    fetchData = (filters) => {

        this.setState({
            messages: [],
            loading: true,
        });

        //alert(payload.role);
        requestAPI('OrderServiceURL', '/vendoradmin/searchorder', 'POST', filters)
            .then((response) => response.json())
            .then((responseJson) => {

                //alert(JSON.stringify(responseJson));

                if ( validateIfStillAuthorized(this.props.navigation, responseJson.status) ) {
                    if ( responseJson.error ) {
                        this.setState({
                            messages: [{
                                message: responseJson.error,
                                type: 'ERROR',
                            }],
                            orderList: [],
                            loading: false,
                        });
                    } else if ( responseJson.messages ) {
                        this.setState({
                            messages: responseJson.messages,
                            loading: false,
                        });
                    } else {
                        this.setState({
                            orderList: responseJson,
                            loading: false,
                        });

                        this.getTotalAmount(responseJson);
                    }
                }

            })
            .catch((error) => {
                this.setState({
                    messages: [GENERIC_API_ERROR],
                    loading: false,
                })
            });
    }

    getTotalAmount = (orders) => {
        var totalAmt = 0;
        for (var i = 0; i < orders.length; i++) {
            totalAmt = totalAmt + orders[i].totalAmount;
        }
        this.setState({totalAmount: totalAmt});

    }

    showFilter = () => {
        this.props.navigation.navigate('OrderFilter', {...this.state.filters});
        //alert(JSON.stringify(this.state.filters));
    }
    // End Component functions

    render () {
        return (
            <View style={ListStyle.parentContainer} onLayout={this.onLayout.bind(this)}>
                <View style = {CommonStyle.activityIndicator} pointerEvents={'none'}>
                    <ActivityIndicator
                        animating = {this.state.loading}
                        color = '#bc2b78'
                        size = "large"/>
                </View>
                <CustomValidationMessage message={this.state.messages} />
                <View style={styles.buttonHeader}>
                    <CustomButton
                        visible={true}
                        primary label='Show Filter'
                        width={150}
                        onPress={this.showFilter}/>
                </View>
                <ScrollView style={{ flexGrow: 1 }}>
                    <FlatList
                        data={this.state.orderList}
                        ListHeaderComponent={this.flatListHeader}
                        ListEmptyComponent={listEmpty("No order found.")}
                        ListFooterComponent={this.flatListFooter}
                        stickyHeaderIndices={[0]}
                        keyExtractor={(item, index) => item + index}
                        ItemSeparatorComponent={flatListSeparator}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity onPress={this.goToDetailScreen.bind(this, item)} >
                                <View style={{ flex: 1, flexDirection:'row', backgroundColor: Colors.white, flexShrink: 0,}}>
                                    <View style={{ flex: this.state.COL_WIDTH_SEQ, flexDirection: 'row', justifyContent: 'flex-end', marginRight: 0}}>
                                        <Text style={ListStyle.listTextBold}>{index + 1} {item.referenceOrder}</Text>
                                    </View>
                                    <View style={{ flex: this.state.COL_WIDTH_ORDER, flexDirection: 'column', marginLeft: 0}}>
                                        <Text style={ListStyle.listText}>{item.userId} / {item.status}</Text>
                                        <Text style={ListStyle.listText}>{moment(item.orderDate).format('YYYY/MM/DD HH:mm:ss')}</Text>
                                    </View>
                                    <View style={{ flex: this.state.COL_WIDTH_AMOUNT, flexDirection: 'row', justifyContent: 'flex-end', marginRight: 0}}>
                                        <Text style={ListStyle.listTextBold}>{formatMoney(item.totalAmount, "Php ", 2, ",", ".")}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity >
                        )}
                    />
                </ScrollView>
            </View>
        );
    }
}

export default withNavigationFocus(OrderList);

const styles = StyleSheet.create ({
    buttonHeader: {
        flexDirection: 'row-reverse',
    },
})