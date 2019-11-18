import React, { Component } from 'react';
import { View,
    ScrollView,
    Animated,
	Dimensions,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    FlatList,
    Image,
    ActivityIndicator,
    } from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import { withNavigationFocus } from "react-navigation";
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import ActionSheet from 'react-native-actionsheet';
import { Dropdown } from 'react-native-material-dropdown';

import { listEmpty, flatListSeparator } from "../../components/ListCommonComponent";
import { getPayload, validateIfStillAuthorized } from "../../config/auth";
import { USER_ROLE_VENDOR_ADMIN, USER_ROLE_VENDOR_USER } from "../../config/constant";
import { requestAPI } from '../../components/RestAPI';
import CustomValidationMessage from '../../components/CustomValidationMessage';
import ValidationScheme from '../../components/ValidationScheme';
import '../../components/ValidateWrapper';
import { GENERIC_API_ERROR } from '../../config/messages';
import { CustomButton } from '../../components/CommonComponent';
import { formatMoney } from "../../components/Accounting";
import { ItemProduct } from "../../components/ItemProduct";

import { ConfirmationAlert } from "../../utils/Util";

import Colors from '../../components/Colors';
import CommonStyle from '../../styles/styles';
import ListStyle from '../../styles/styles-list';


class AddOrderItemButton extends Component {

    addProduct = () => {
        this.props.navigation.navigate('OrderProduct', { ...this.props.order} );
    }

    render() {
        if ( this.props.visible && (this.props.order.status=='New' || this.props.order.status=='Ordering') ) {
            return (
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={this.addProduct}
                        style={styles.AddButton}>
                        <Image
                            source={require('../../res/icons/add_icon.png')}
                            style={CommonStyle.AddImageButtonStyle}/>
                    </TouchableOpacity>
                </View>
            )
        } else {
            return null;
        }

    }
}

class Order extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            objectType: 'Order',
            role: '',
            referenceOrder: '',
            status: '',
            order: {},
            orders: [],
            vendorDiscount: [],
            optionAction: [],
            appUserList: [],
            messages: [],
            loading: false,
            updateMode: false,
            COL_WIDTH_ITEM: 45/100,
            COL_WIDTH_BASE_PRICE: 20/100,
            COL_WIDTH_QUANTITY: 10/100,
            COL_WIDTH_TOTAL_AMOUNT: 25/100,
        };

        this.adminOption1 = [
            'Change User / Status',
            'Show History',
            'Cancel'
        ];
        this.adminOption2 = [
            'Save',
            'Cancel'
        ];

    }

    componentWillMount = () => {

        getPayload()
            .then(payload => {
                this.setState({
                    role: payload.role,
                });

                if (this.props.navigation.state.params) {
                    const {width, height} = Dimensions.get('window');
                    const { id, referenceOrder, orderDate, vendorId, userId, status, totalAmount, orders } = this.props.navigation.state.params;
                    this.setState({
                        id: id,
                        referenceOrder: referenceOrder,
                        orderDate: orderDate,
                        vendorId: vendorId,
                        userId: userId,
                        origUserId: userId,
                        status: status,
                        origStatus: status,
                        totalAmount: totalAmount,
                        orders: orders,
                        orientation: (height>width ? 'portrait' : 'landscape'),
                        container_style: (height>width ? styles.container_portrait : styles.container_landscape),
                        content_result_style: (height>width ? styles.content_result_portrait :
                            (status=='New' || status=='Ordering' ? styles.content_result_landscape: styles.content_result_landscape_full)),
                        content_button_style: (height>width ? styles.content_button_portrait : styles.content_button_landscape),
                    });
                    //alert(JSON.stringify(orders));
                    AsyncStorage.setItem('Order', JSON.stringify(this.props.navigation.state.params));
                } else if ( payload.role == USER_ROLE_VENDOR_USER ) {
                    this.createOrder();
                }

                if ( payload.role == USER_ROLE_VENDOR_ADMIN ) {
                    this.getAppUserList();
                }

                this.getVendorDiscount();

            });

    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused && this.props.isFocused) {
            this.retrieveSavedOrder();
        }
    }

    onLayout(e) {
        const {width, height} = Dimensions.get('window')
        console.log(width, height)
        this.setState({
            orientation: (height>width ? 'portrait' : 'landscape'),
            container_style: (height>width ? styles.container_portrait : styles.container_landscape),
            content_result_style: (height>width ? styles.content_result_portrait :
                (
                    ( (this.state.status=='New' || this.state.status=='Ordering') && this.state.role == USER_ROLE_VENDOR_USER ) ||
                    ( this.state.status=='Paid' && this.state.role == USER_ROLE_VENDOR_ADMIN )
                        ? styles.content_result_landscape: styles.content_result_landscape_full)
                ),
            content_button_style: (height>width ? styles.content_button_portrait :
                (
                    ( (this.state.status=='New' || this.state.status=='Ordering') && this.state.role == USER_ROLE_VENDOR_USER ) ||
                    ( this.state.status=='Paid' && this.state.role == USER_ROLE_VENDOR_ADMIN )
                        ? styles.content_button_landscape: {})
                ),
        });
    }
    // End Components triggers

    // Start Flat List Content
    flatListHeader = () => {
        return (
            <View style={ListStyle.flatlist_header_group}>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_ITEM }]}>Item</Text>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_BASE_PRICE }, ListStyle.align_right,]}>Price</Text>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_QUANTITY }, ListStyle.align_right,]}>Qty.</Text>
                <Text style={[ListStyle.flatlist_header_text, { flex: this.state.COL_WIDTH_TOTAL_AMOUNT }, ListStyle.align_right,]}>Amount</Text>
            </View>
        );
    };

    flatListContent = (item) => {
        var discountDetail = "";
        if ( item.free==true ) {
            discountDetail = "FREE";
        } else {
            if ( item.discountRef && item.discountRef.value ) {
                discountDetail = item.discountRef.value + "%";
                if ( item.product && item.product.prodComp && item.product.prodComp.featuresStr != '' ) {
                    discountDetail = discountDetail + "," + item.product.prodComp.featuresStr;
                }
            } else if ( item.product && item.product.prodComp && item.product.prodComp.featuresStr != '' ) {
                discountDetail = item.product.prodComp.featuresStr;
            }
        }
        if ( discountDetail!="" ) {
            return (
                <View key={item.key}>
                    <View style={ListStyle.flatlist_content_group}>
                        <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_ITEM}]}>{item.product.name}</Text>
                        <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_BASE_PRICE}, ListStyle.align_right]}>{formatMoney(item.product.prodComp.basePrice, "Php ", 2, ",", ".")}</Text>
                        <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_QUANTITY}, ListStyle.align_right]}>&nbsp;</Text>
                        <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_TOTAL_AMOUNT}, ListStyle.align_right]}>&nbsp;</Text>
                    </View>
                    <View style={ListStyle.flatlist_content_group}>
                        <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_ITEM}]}>&nbsp;</Text>
                        <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_BASE_PRICE}, ListStyle.align_right]}>{discountDetail}</Text>
                        <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_QUANTITY}, ListStyle.align_right]}>{item.quantity}</Text>
                        <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_TOTAL_AMOUNT}, ListStyle.align_right]}>{formatMoney(item.amountDue, "Php ", 2, ",", ".")}</Text>
                    </View>
                </View>
            );

        } else {
            return (
                <View key={item.key} style={ListStyle.flatlist_content_group}>
                    <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_ITEM}]}>{item.product.name}</Text>
                    <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_BASE_PRICE}, ListStyle.align_right]}>{formatMoney(item.product.prodComp.basePrice, "Php ", 2, ",", ".")}</Text>
                    <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_QUANTITY}, ListStyle.align_right]}>{item.quantity}</Text>
                    <Text style={[ListStyle.flatlist_content_text, {flex:this.state.COL_WIDTH_TOTAL_AMOUNT}, ListStyle.align_right]}>{formatMoney(item.amountDue, "Php ", 2, ",", ".")}</Text>
                </View>
            );
        }

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
    // End Flat List Content


    // Start Swipe functions
	cancelRow(rowMap, rowKey) {
		if (rowMap[rowKey]) {
			rowMap[rowKey].closeRow();
		}
	}

	deleteRow(rowMap, item) {

        ConfirmationAlert('Delete', 'Do you want to delete ' + item.product.name + '?',
            () => {
                this.cancelRow(rowMap, item.key);
                this.requestOrder('/vendoruser/removefromorderlist/' + this.state.id + '/' + item.product.id, 'GET', null);
            }
        )

	}
    // End Swipe functions


    // Start Component Functions

    // Call API
    requestOrder = (uri, method, body) => {

        this.setState({
            messages: [],
            loading: true,
        });

        requestAPI('OrderServiceURL', uri, method, body)
            .then((response) => response.json() )
            .then((responseJson) => {
                //alert(JSON.stringify(responseJson))

                if ( validateIfStillAuthorized(this.props.navigation, responseJson.status) ) {
                    if ( responseJson.messages ) {
                        this.setState ({
                            messages: responseJson.messages,
                        });

                        if ( responseJson.order ) {
                            this.setState ({
                                id: responseJson.order.id,
                                referenceOrder: responseJson.order.referenceOrder,
                                orderDate: responseJson.order.orderDate,
                                vendorId: responseJson.order.vendorId,
                                userId: responseJson.order.userId,
                                origUserId: responseJson.order.userId,
                                status: responseJson.order.status,
                                origStatus: responseJson.order.status,
                                totalAmount: responseJson.order.totalAmount,
                                orders: responseJson.order.orders,
                                loading: false,
                                updateMode: false,
                            });
                            AsyncStorage.setItem('Order', JSON.stringify(responseJson.order));
                        }

                        this.onLayout(this);

                    } else if ( responseJson.error ) {
                        this.setState({
                            messages: [{
                                message: responseJson.error,
                                type: 'ERROR',
                                loading: false,
                            }]
                        })
                    }
                }

            })
            .catch((error) => {
                alert(error);
                this.setState({
                    messages: [GENERIC_API_ERROR],
                    loading: false,
                })
            });

    }

    getVendorDiscount = () => {

        AsyncStorage.getItem('VendorDiscount').then(vendorDiscount => {

            if ( vendorDiscount==null ) {
                requestAPI('ConfigServiceURL', '/vendoruser/viewreferencedatabygroup/Discount', 'GET')
                    .then((response) => response.json() )
                    .then((responseJson) => {
                        //alert(JSON.stringify(responseJson))

                        if ( validateIfStillAuthorized(this.props.navigation, responseJson.status) ) {

                            if ( responseJson.messages || responseJson.error ) {
                                AsyncStorage.removeItem('VendorDiscount');
                            } else {
                                AsyncStorage.setItem('VendorDiscount', JSON.stringify(this.convertDiscountToList(responseJson)));
                            }
                        }

                    })
                    .catch((error) => {
                        AsyncStorage.removeItem('VendorDiscount');
                    });
            }
        });

    }

    convertDiscountToList = (jsonData) => {
        var oList = []
        var oListData = {};
        oListData.label = 'N/A';
        oListData.value = '';
        oList.push(oListData);
        for (var i = 0; i < jsonData.length; i++) {
            oListData = {};
            oListData.value = jsonData[i].id;
            oListData.label = jsonData[i].name;
            oListData.discount = jsonData[i].value;
            oList.push(oListData);
        }
        return oList;
    }

    getAppUserList = () => {

        AsyncStorage.getItem('AppUserList').then(appUserList => {
            this.setState({appUserList: JSON.parse(appUserList)})
        });

    }

    // Create new order
    createOrder = () => {
        this.requestOrder('/vendoruser/createneworder', 'POST', {});
    }

    // Save Order change (Status, etc.)
    saveOrder = () => {

        this.state.order['id'] = this.state.id;
        this.state.order['referenceOrder'] = this.state.referenceOrder;
        this.state.order['orderDate'] = this.state.orderDate;
        this.state.order['vendorId'] = this.state.vendorId;
        this.state.order['userId'] = this.state.userId;
        this.state.order['status'] = this.state.status;
        this.state.order['totalAmount'] = this.state.totalAmount;

        //alert(JSON.stringify(this.state.order));
        //return;

        var errors = validateForm(this.state.order, ValidationScheme.OrderRegistration);
        this.setState({messages: convertValErrorToAppError(errors)});

        if (!Array.isArray(errors) || !errors.length) {
            this.requestOrder((this.state.role == USER_ROLE_VENDOR_ADMIN ? '/vendoradmin' : '/vendoruser') + '/updateorder', 'POST', this.state.order);
        }
    }

    // Set Order Status to Paid
    settlePayment = () => {

        var errors = validateForm(this.state, ValidationScheme.SettlePayment);
        this.setState({messages: convertValErrorToAppError(errors)});

        if (!Array.isArray(errors) || !errors.length) {
            ConfirmationAlert(
                'Settle Payment',
                'Please confirm payment receive Total Amount ' + formatMoney(this.state.totalAmount, "Php ", 2, ",", ".") + '.',
                () => {
                    this.setState({status: 'Paid'});
                    this.saveOrder();
                }
            )
        }
    }

    // Set Order Status to Cancelled
    cancelOrder = () => {

        ConfirmationAlert('Cancel Order', 'Are you sure you want to cancel order?',
            () => {
                this.setState({status: 'Cancelled'});
                this.saveOrder();
            }
        )

    }

    // Set Order Status to Refund
    refundOrder = () => {

        ConfirmationAlert('Refund Order', 'Are you sure you want to refund order amounting ' + formatMoney(this.state.totalAmount, "Php ", 2, ",", ".") + '?',
            () => {
                this.setState({status: 'Refund'});
                this.saveOrder();
            }
        )

    }

    // Update Order Status by Admin
    updateOrder = () => {

        ConfirmationAlert('Update Order', 'Are you sure you want to update order?',
            () => {
                this.saveOrder();
            }
        )

    }

    // Retrieve Order from storage
    retrieveSavedOrder = () => {
        AsyncStorage.getItem('Order').then(value => {
            var order = JSON.parse(value);

            // Reload if current order and saved/updated order
            if ( order.id == this.state.id ) {
                this.setState({
                    status: order.status,
                    totalAmount: order.totalAmount,
                    orders: order.orders,
                    messages: [],
                });
            }

        });

    }

    showActionSheet = () => {
        //To show the Bottom ActionSheet
        this.ActionSheet.show();
    };

    performAction = (index) => {

        if ( this.state.updateMode ) {
            if ( index==0 ) {
                this.updateOrder();
            } else if ( index==1 ) {
                this.setState({
                    userId: this.state.origUserId,
                    status: this.state.origStatus,
                    updateMode: false,
                    messages: [],
                });
            }
        } else {
            if ( index==0 ) {
                this.setState({
                    updateMode: true,
                    messages: [],
                });
            } else if ( index==1 ) {
                this.props.navigation.navigate('History', { ...this.state} );
            }
        }

    }

    // End Component Functions


    render() {
        return (
            <View style={this.state.container_style} onLayout={this.onLayout.bind(this)}>
                <View style={this.state.content_result_style}>
                    <View style = {CommonStyle.activityIndicator} pointerEvents={'none'}>
                        <ActivityIndicator
                            animating = {this.state.loading}
                            color = '#bc2b78'
                            size = "large"/>
                    </View>
                    <CustomValidationMessage message={this.state.messages} />
                    <View style={{ flexDirection: 'row'}}>
                        <View style={{flex: 1, justifyContent: "center", padding: 5,}}>
                            <Text style={[CommonStyle.textDisplay, {fontWeight: 'bold'}]} >Reference No: {this.state.referenceOrder}</Text>
                            {!this.state.updateMode && this.state.role == USER_ROLE_VENDOR_ADMIN &&
                                <Text style={[CommonStyle.textDisplay, {fontWeight: 'bold'}]} >User: {this.state.userId}</Text>
                            }
                            {!this.state.updateMode &&
                                <Text style={[CommonStyle.textDisplay, {fontWeight: 'bold'}]} >Status: {this.state.status}</Text>
                            }
                            {this.state.updateMode &&
                                <Dropdown
                                    label='User'
                                    data={this.state.appUserList}
                                    value={this.state.userId}
                                    onChangeText={(value) => this.setState({userId: value})}
                                />
                            }
                            {this.state.updateMode &&
                                <Dropdown
                                    label='Status'
                                    data={[{value:'New'}, {value:'Ordering'}, {value:'Paid'}, {value:'Cancelled'}, {value:'Refund'}]}
                                    value={this.state.status}
                                    onChangeText={(value) => this.setState({status: value})}
                                />
                            }
                        </View>
                        <AddOrderItemButton navigation={this.props.navigation} visible={this.state.role == USER_ROLE_VENDOR_USER} order={this.state} />
                    </View>
                    <SwipeListView
                        data={this.state.orders}
                        ListHeaderComponent={this.flatListHeader}
                        ListFooterComponent={this.flatListFooter}
                        ItemSeparatorComponent={flatListSeparator}
                        ListEmptyComponent={listEmpty("No order item found.")}
                        stickyHeaderIndices={[0]}
                        keyExtractor={(item, index) => item.key + index}
                        renderItem={ (data, rowMap) => (
                            <ItemProduct
                                product={data.item.product}
                                navigation={this.props.navigation}
                                orderId={this.state.id}
                                clickable={this.state.status=='Ordering' && this.state.role == USER_ROLE_VENDOR_USER}
                                content={this.flatListContent(data.item)}
                                postEvent={this.retrieveSavedOrder.bind(this)}
                            />

                        )}
                        renderHiddenItem={ (data, rowMap) => (
                            this.state.status=='Ordering' && this.state.role == USER_ROLE_VENDOR_USER &&
                            <View style={styles.rowBack}>
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={ _ => this.cancelRow(rowMap, data.item.key) }>
                                    <Text style={styles.backTextWhite}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.deleteRow(rowMap, data.item) }>
                                    <Image source={require('../../res/images/trash.png')} style={styles.trash} />
                                </TouchableOpacity>
                            </View>
                        )}
                        disableRightSwipe={true}
                        disableLeftSwipe={this.state.status=='Paid' || this.state.status=='Cancelled' || this.state.status=='Refund'}
                        rightOpenValue={this.state.status=='Ordering' ? -150 : 0}
                        previewRowKey={'0'}
                        previewOpenValue={this.state.status=='Paid' || this.state.status=='Cancelled' || this.state.status=='Refund' ? 0 : -50}
                        previewOpenDelay={this.state.status=='Paid' || this.state.status=='Cancelled' || this.state.status=='Refund' ?  -1 : 3000}
                    />
                </View>
                <View style={this.state.content_button_style}>
                    <CustomButton
                        visible={this.state.status=='Ordering' && this.state.role == USER_ROLE_VENDOR_USER}
                        primary label='Pay'
                        width={150}
                        onPress={this.settlePayment}/>
                    <CustomButton visible={(this.state.status=='New' || this.state.status=='Ordering') && this.state.role == USER_ROLE_VENDOR_USER}
                        primary={this.state.status=='New'}
                        label='Cancel'
                        width={150}
                        onPress={this.cancelOrder}/>
                    <CustomButton
                        visible={this.state.role == USER_ROLE_VENDOR_ADMIN}
                        primary={true}
                        label={"Action"}
                        width={300}
                        onPress={this.showActionSheet} />
                    <ActionSheet
                        ref={o => (this.ActionSheet = o)}
                        //Title of the Bottom Sheet
                        title={'Please select action'}
                        //Options Array to show in bottom sheet
                        options={this.state.updateMode ? this.adminOption2 : this.adminOption1}
                        //Define cancel button index in the option array
                        //this will take the cancel option in bottom and will highlight it
                        cancelButtonIndex={this.state.updateMode ? 1 : 2}
                        //If you want to highlight any specific option you can use below prop
                        destructiveButtonIndex={0}
                        onPress={index => this.performAction(index)}
                    />
                </View>
            </View>
        );
    }
}

export default withNavigationFocus(Order);

const styles = StyleSheet.create ({
	backTextWhite: {
		color: '#FFF'
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: '#DDD',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexGrow: 1,
		paddingLeft: 15,
		//borderWidth: 1,
	},
	backRightBtn: {
		alignItems: 'center',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		width: 75
	},
	backRightBtnLeft: {
		backgroundColor: 'blue',
		right: 75
	},
	backRightBtnRight: {
		backgroundColor: 'red',
		right: 0
	},
	trash: {
		height: 25,
		width: 25,
	},
    AddButton: {
        width: 40,
        height: 40,
    },
    container_portrait: {
        flex: 1,
        flexDirection: 'column',
        margin: 5,
    },
    container_landscape: {
        flex: 1,
        flexDirection: 'row',
        margin: 5,
    },
    content_result_portrait: {
        flex: 8,
        flexDirection: 'column',
    },
    content_button_portrait: {
        flex: 2,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
    },
    content_result_landscape: {
        flex: 7,
        flexDirection: 'column',
    },
    content_button_landscape: {
        flex: 3,
        flexDirection: 'column',
        alignItems: "center",
    },
    content_result_landscape_full: {
        flex: 1,
        flexDirection: 'column',
    },
})