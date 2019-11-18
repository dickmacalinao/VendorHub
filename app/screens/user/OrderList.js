import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
	Dimensions,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator
    } from 'react-native';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import { withNavigationFocus } from "react-navigation";

import { validateIfStillAuthorized } from "../../config/auth";
import { requestAPI } from '../../components/RestAPI';
import { listEmpty, flatListSeparator } from "../../components/ListCommonComponent";
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
            selectedDate: new Date(),
            loading: false,
            orderList: [],
            messages: [],
            COL_WIDTH_SEQ: 1/10,
            COL_WIDTH_ORDER: 5/10,
            COL_WIDTH_AMOUNT: 4/10,
        }
    }

    componentWillMount = () => {
        this.onLayout(this);
        this.fetchData(moment(this.state.selectedDate).format('YYYY-MM-DD'));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused && this.props.isFocused) {
            this.fetchData(moment(this.state.selectedDate).format('YYYY-MM-DD'));
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
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_SEQ }]}>Seq.</Text>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_ORDER }]}>Order</Text>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_AMOUNT }, ListStyle.align_right,]}>Amount</Text>
            </View>
        );
    };
    // End Flat List functions


    // Start Component functions

    // Search order
    searchOrder = (date) => {
        this.setState({
            selectedDate: date,
        });
        this.fetchData(moment(this.state.selectedDate).format('YYYY-MM-DD'));
    }

    // Create new Order
    goToReg = () => {
        this.props.navigation.navigate('OrderItem');
    }

    // Show Order detail
    goToDetailScreen = (order) => {
        this.props.navigation.navigate('OrderItem', { ...order} );
    }

    // Refresh list
    refreshList = () => {
        this.fetchData(moment(this.state.selectedDate).format('YYYY-MM-DD'));
    }

    // Call API
    fetchData = (date) => {

        this.setState({
            messages: [],
            loading: true,
        });

        requestAPI('OrderServiceURL', '/vendoruser/getorderfortheday/' + date, 'GET')
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
                <View style={{ flexGrow: 0, flexDirection: 'row', marginBottom: 5}}>
                    <View style={{alignSelf: 'center'} }>
                        <Text style={ListStyle.listTextBold}>Order Date:</Text>
                    </View>
                    <View>
                        <DatePicker
                            style={{width: 150}}
                            date={this.state.selectedDate} //initial date from state
                            mode="date" //The enum of date, datetime and time
                            placeholder="Select date"
                            format="YYYY-MM-DD"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                                dateIcon: {
                                    position: 'absolute',
                                    left: 0,
                                    top: 4,
                                    marginLeft: 0
                                },
                                dateInput: {
                                    marginLeft: 36
                                },
                                dateText: {
                                    fontSize: 14,
                                    color: "black",
                                    textAlign: "left"
                                }
                            }}
                            onDateChange={(date) => {this.searchOrder(date)}}
                        />
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={this.goToReg}
                            style={styles.AddButton}>
                            <Image
                                source={require('../../res/icons/add_icon.png')}
                                style={CommonStyle.AddImageButtonStyle}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flexGrow: 1 }}>
                    <FlatList
                        data={this.state.orderList}
                        ListHeaderComponent={this.flatListHeader}
                        ListEmptyComponent={listEmpty("No order found.")}
                        ListFooterComponent={<View style={{ height: 0, marginBottom: 90 }}></View>}
                        stickyHeaderIndices={[0]}
                        keyExtractor={(item, index) => item + index}
                        ItemSeparatorComponent={flatListSeparator}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity onPress={this.goToDetailScreen.bind(this, item)} >
                                <View style={{ flex: 1, flexDirection:'row', backgroundColor: Colors.white, flexShrink: 0,}}>
                                    <View style={{ flex: this.state.COL_WIDTH_SEQ, flexDirection: 'row', justifyContent: 'flex-end', marginRight: 0}}>
                                        <Text style={ListStyle.listTextBold}>{index + 1}</Text>
                                    </View>
                                    <View style={{ flex: this.state.COL_WIDTH_ORDER, flexDirection: 'column', marginLeft: 0}}>
                                        <Text style={ListStyle.listTextBold}>Reference No: {item.referenceOrder}</Text>
                                        <Text style={ListStyle.listText}>Status: {item.status}</Text>
                                    </View>
                                    <View style={{ flex: this.state.COL_WIDTH_AMOUNT, flexDirection: 'row', justifyContent: 'flex-end', marginRight: 0}}>
                                        <Text style={ListStyle.listTextBold}>{formatMoney(item.totalAmount, "Php ", 2, ",", ".")}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity >
                        )}
                    />
                </View>
            </View>
        );
    }
}

export default withNavigationFocus(OrderList);

const styles = StyleSheet.create ({
    AddButton: {
        width: 40,
        height: 40,
    },
})