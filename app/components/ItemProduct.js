import React, { Component } from 'react';
import { View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Button,
    Image,
    } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from "react-native-modal";
import NumericInput from 'react-native-numeric-input';
import { Card, CardTitle, CardContent, CardAction, CardButton, CardImage } from 'react-native-material-cards';

import { requestAPI, requestAPIDirect } from '../components/RestAPI';
import { formatMoney } from "../components/Accounting";
import { CustomButton, DynamicDropDown } from '../components/CommonComponent';

import Colors from '../components/Colors';
import CommonStyle from '../styles/styles';

export class ItemProduct extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            quantity: 1,
            free: false,
            selectedProduct: {},
            orderItem: {
                productId: '',
                amountDue: '',
                quantity: '',
            },
            discountSelected: '',
            discountOption: [],
            messages: [],
        };
    }

    componentWillMount = () => {
        //alert(JSON.stringify(this.state.discountOption));
        AsyncStorage.getItem('VendorDiscount').then(vendorDiscount => {
            this.setState({
                discountOption: JSON.parse(vendorDiscount),
            });
        })
    }

    toggleModal = () => {
        this.setState({ isModalVisible: !this.state.isModalVisible });
    };

    goToDetailScreen = (product) => {

        AsyncStorage.getItem('Order').then(value => {
            var order = JSON.parse(value);

            // Get Quantity if already selected product list
            var storedQty = 1;
            var isFree = false;
            var discountRef = {};
            if ( order && order.orders ) {
                order.orders.forEach(
                    function (item, index) {
                        if( item.product && item.product.id==product.id ) {
                            storedQty = item.quantity;
                            isFree = item.free;
                            discountRef = item.discountRef;
                        }
                    }
                );
            }

            this.setState({
                selectedProduct: product,
                quantity: storedQty,
                free: isFree,
                discountRef: discountRef,
            });

            if ( discountRef && discountRef.id )  {
                this.setState({
                    discountSelected: discountRef.id
                });

            }

            this.toggleModal();
        });

    }

    confirmOrder = () => {

        if (this.state.quantity < 1) {
            alert('Quantity should be more than 0.');
            return;
        }

        var uri = '/vendoruser/addtoorderitem/' + this.props.orderId + '/' + this.state.selectedProduct.id;

        var discountRef = {};
        if ( !this.state.free && this.state.discountSelected!='' ) {
            for ( var i=0; i<this.state.discountOption.length; i++ ) {
                if ( this.state.discountSelected== this.state.discountOption[i].value ) {
                    discountRef = {
                        id: this.state.discountSelected,
                        name: this.state.discountOption[i].label,
                        value: this.state.discountOption[i].discount,
                    }
                }
            }
        }

        var oItem = {
            quantity: this.state.quantity,
            free: this.state.free,
            discountRef: discountRef,
        }

        requestAPI('OrderServiceURL', uri, 'POST', oItem)
            .then((response) => response.json() )
            .then((responseJson) => {
                AsyncStorage.setItem('Order', JSON.stringify(responseJson.order));
                if ( responseJson.error ) {
                    alert(responseJson.error);
                } else {
                    alert(responseJson.messages[0].message);
                    if ( this.props.postEvent ) {
                        this.props.postEvent(responseJson.order.orders);
                    }
                }
                this.toggleModal();
            })
            .catch((error) => {
                alert(error);
            });
    }

    render() {

        return (
            <View>
                <TouchableOpacity onPress={this.props.clickable ? this.goToDetailScreen.bind(this, this.props.product) : null} >
                    {this.props.content}
                </TouchableOpacity>
                <Modal isVisible={this.state.isModalVisible} style={styles.modalStyle} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text>Specify Quantity</Text>
                            <NumericInput
                                value={this.state.quantity}
                                onChange={value => this.setState({quantity: value})}
                                onLimitReached={(isMax,msg) => console.log(isMax,msg)}
                                totalWidth={150}
                                totalHeight={40}
                                iconSize={20}
                                step={1}
                                valueType='real'
                                rounded
                                textColor='#B0228C'
                                iconStyle={{ color: 'white' }}
                                rightButtonBackgroundColor='#EA3788'
                                leftButtonBackgroundColor='#E56B70'
                            />
                            <CheckBox
                                title='Free'
                                checked={this.state.free}
                                onPress={() => this.setState({free: !this.state.free, discountSelected: ''})}
                            />
                            <DynamicDropDown
                                visible={!this.state.free}
                                label='Discount'
                                data={this.state.discountOption}
                                value={this.state.discountSelected}
                                onChangeText={(value) => this.setState({
                                    discountSelected: value,
                                })}
                            />
                            <Text>{"\n"}</Text>
                        </View>
                        <View style={styles.modalButton}>
                            <CardButton
                                onPress={this.confirmOrder}
                                title="Confirm"
                                color="blue"
                            />
                            <CardButton
                                onPress={this.toggleModal}
                                title="Cancel"
                                color="blue"
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create ({
    modalStyle: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flexDirection: 'column',
        width: 300,
        height: 280,
        backgroundColor: 'white',
        borderWidth: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        flex: 230,
        flexDirection: 'column',
    },
    modalButton: {
        flex: 50,
        flexDirection: 'row-reverse',
    },
})