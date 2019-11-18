import React, { Component } from 'react';
import { View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    Image,
    ActivityIndicator,
    } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import DynamicTabView from "react-native-dynamic-tab-view";
import { withNavigationFocus } from "react-navigation";

import { requestAPI, requestAPIDirect } from '../../components/RestAPI';
import { listEmpty } from "../../components/ListCommonComponent";
import { ItemProduct } from "../../components/ItemProduct";

import Colors from '../../components/Colors';
import CommonStyle from '../../styles/styles';
import CustomValidationMessage from '../../components/CustomValidationMessage';
import ValidationScheme from '../../components/ValidationScheme';
import '../../components/ValidateWrapper';
import { GENERIC_API_ERROR } from '../../config/messages';

import { formatMoney } from "../../components/Accounting";

export class ProductGroupList extends Component {

    productContent = (item) => {
        return (
            <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', padding: 5, }}>
                <Image style={[styles.imageThumbnail,]} source={{ uri: (item.imgLocation ? item.imgLocation : "https://res.cloudinary.com/ckidtech/image/upload/v1562740824/quotation-product/noimage.jpg") }} />
                <View style={{flexDirection: 'column', marginLeft: 10}}>
                    <Text>{item.name}</Text>
                    <View style={{flex: 1, flexDirection: 'row',}}>
                        <Text style={item.prodComp.basePrice !== item.prodComp.computedAmount ? CommonStyle.textInputStrikeThrough : {}}>{formatMoney(item.prodComp.basePrice, "Php ", 2, ",", ".")}</Text>
                        <Text>&nbsp;&nbsp;</Text>
                        <Text>{item.prodComp.basePrice !== item.prodComp.computedAmount ? formatMoney(item.prodComp.computedAmount, "Php ", 2, ",", ".") : ''}</Text>
                    </View>
                </View>
            </View>
        );
    };

    render() {
        return (
            <View>
                <FlatList
                    data={this.props.productGroup.data}
                    ListEmptyComponent={listEmpty("No product found.")}
                    renderItem={({ item, index }) => (
                        <ItemProduct
                            key={item.id + index}
                            product={item}
                            navigation={this.props.navigation}
                            clickable={true}
                            orderId={this.props.order.id}
                            content={this.productContent(item)}
                        />
                    )}
                    //Setting the number of column
                    //numColumns={2}
                    //columnWrapperStyle = {{flex: 1, borderWidth: 1, alignItems: 'center',}}
                    ref={(ref) => { this.list = ref; }}
                    keyExtractor={(item, index) => item.id + index}
                    //onScroll={(e) => { console.log('onScroll', e.nativeEvent); }}
                />
            </View>
        )
    }
}

class ProductList extends Component {

    // Start Component triggers
    constructor(props) {
        super(props)
        this.state = {
            order: {},
            prodGroups: [{'title':'Product Group', 'key':'#'}],
            defaultIndex: 0,
            messages: [],
            loading: false,
        }
    }

    componentWillMount = () => {

        if (this.props.navigation.state.params) {
            const { id, referenceOrder, orderDate, vendorId, userId, status, orders } = this.props.navigation.state.params;
            this.setState({
                order: {
                    id: id,
                    referenceOrder: referenceOrder,
                    orderDate: orderDate,
                    vendorId: vendorId,
                    userId: userId,
                    status: status,
                    orders: orders,
                },
            });
            this.fetchProductData();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused && this.props.isFocused) {
            this.fetchProductData();
        }
    }

    onLayout(e) {
        const {width, height} = Dimensions.get('window')
        console.log(width, height)
        this.setState({
            orientation: (height>width ? 'portrait' : 'landscape'),
        });
    }

    // End Component triggers

    fetchProductData = () => {

        this.setState({
            messages: [],
            loading: true,
        });

        // Check if Product Groups already in cache, otherwise retrieve them first
        AsyncStorage.getItem('ProdGroups').then(prodGroups => {

            //alert(productRetrieved);

            if ( prodGroups ) {

                this.setState({
                    prodGroups: JSON.parse(prodGroups),
                    loading: false,
                });

            } else {
                requestAPI('ProductServiceURL', '/vendoruser/listactiveproductsbygroup/', 'GET')
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
                            AsyncStorage.removeItem('ProdGroups');
                        } else {
                            this.setState({
                                prodGroups: responseJson.prodGroups,
                                loading: false,
                            });
                            AsyncStorage.setItem('ProdGroups', JSON.stringify(responseJson.prodGroups));
                        }

                        //alert(JSON.stringify(responseJson.prodGroups));

                    })
                    .catch((error) => {
                        this.setState({
                            messages: [GENERIC_API_ERROR],
                            loading: false,
                        })
                        AsyncStorage.removeItem('ProdGroups');
                    });
            }

        });

    }

    _renderItem = (item, index) => {
        if ( item.data && item.data.length > 0 ) {
            return (
                <View key={item.key + index} style={{width: 1000}}>
                    <ProductGroupList productGroup={item}
                        key={item.key}
                        navigation={this.props.navigation}
                        order={this.state.order}
                    />
                </View>
            );
        } else {
            return (
                <View key={item.title + index + "no-data"} style={{ flex: 1 }}>
                    <Text>No product</Text>
                </View>
            );
        }
    };

    render() {
        return (
            <View style={CommonStyle.mainContainer} onLayout={this.onLayout.bind(this)}>
                <View style = {CommonStyle.activityIndicator} pointerEvents={'none'}>
                    <ActivityIndicator
                        animating = {this.state.loading}
                        color = '#bc2b78'
                        size = "large"/>
                </View>
                <CustomValidationMessage message={this.state.messages} />
                <DynamicTabView
                    data={this.state.prodGroups}
                    renderTab={this._renderItem}
                    defaultIndex={this.state.defaultIndex}
                    containerStyle={this.state.orientation=='portrait' ? styles.container1 : styles.container2}
                    headerBackgroundColor={Colors.purple}
                    headerTextStyle={styles.headerText}
                    headerUnderlayColor={'blue'}
                />
            </View>
        );
    }
}

export default withNavigationFocus(ProductList);

const styles = StyleSheet.create ({
    container1: {
        flexGrow: 1,
    },
    container2: {
        flexGrow: 1,
    },
    headerText: {
        color: Colors.white
    },
    imageThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        width: 60,
    },
})