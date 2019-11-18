import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TouchableHighlight,
    FlatList,
    Dimensions
    } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { withNavigationFocus } from "react-navigation";
import { SwipeListView } from 'react-native-swipe-list-view';

import { GENERIC_API_ERROR } from '../../config/messages';

import { requestAPI } from '../../components/RestAPI';
import { listEmpty, flatListSeparator } from "../../components/ListCommonComponent";
import CustomValidationMessage from '../../components/CustomValidationMessage';
import { formatMoney } from "../../components/Accounting";
import Colors from '../../components/Colors';

import { ConfirmationAlert } from "../../utils/Util";

import CommonStyle from '../../styles/styles';
import ListStyle from '../../styles/styles-list';


class ProductFeed extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            //vendorId: '',
            loading: false,
            prodGroups: [{title:'Product Loading...', key:'#', data:[]}],
            products: [],
            messages: [],
            defaultIndex: 0,
        };
    }

    componentWillMount = () => {
        this.setState({
            messages: [],
        });
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused && this.props.isFocused) {
            this.setState({
                messages: [],
            });
            this.fetchData();
        }
    }

    // End Components triggers

    // Start Flat List Content
    flatListHeader = (section) => {
        return (
            <View style={ListStyle.flatlist_header_group}>
                <Text style={[ListStyle.flatlist_header_text, {flex:1}]}>{section.title}</Text>
            </View>
        );
    };

    flatListContent = (item) => {
        return (
            <TouchableHighlight
                onPress={this.goToDetailScreen.bind(this, item)}
                style={styles.rowFront} >
                <View style={{flex: 1, flexDirection: 'row'}} key={item.id}>
                    <Image style={[styles.imageThumbnail,]} source={{ uri: (item.imgLocation ? item.imgLocation : "https://res.cloudinary.com/ckidtech/image/upload/v1562740824/quotation-product/noimage.jpg") }} />
                    <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 5,}}>
                        <Text>{item.name + (item.activeIndicator ? '' : ' (inactive)')}</Text>
                        <View style={{flex: 1, flexDirection: 'row',}}>
                            <Text style={item.prodComp.basePrice !== item.prodComp.computedAmount ? CommonStyle.textInputStrikeThrough : {}}>{formatMoney(item.prodComp.basePrice, "Php ", 2, ",", ".")}</Text>
                            <Text>&nbsp;&nbsp;</Text>
                            <Text>{item.prodComp.basePrice !== item.prodComp.computedAmount ? formatMoney(item.prodComp.computedAmount, "Php ", 2, ",", ".") : ''}</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }

    flatListContentHidden = (item, rowMap) => {
        return (
            <View style={styles.rowBack}>
                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={ _ => this.cancelRow(rowMap, item.id) }>
                    <Text style={styles.backTextWhite}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.deleteRow(rowMap, item) }>
                    <Text style={styles.backTextWhite}>Delete</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // End Flat List Content

    // Start Swipe functions
	cancelRow(rowMap, rowKey) {
	    //alert(JSON.stringify(rowMap[rowKey]));
		if (rowMap[rowKey]) {
			rowMap[rowKey].closeRow();
		}
	}

	deleteRow(rowMap, item) {

        this.setState({
            messages: [],
        });

        ConfirmationAlert('Delete', 'Are you sure you want to delete ' + item.name + '?',
            () => {

                this.setState({
                    loading: true,
                });

                var uri = '/vendoradmin/deletevendorproduct/' + item.id;

                //alert(uri);
                requestAPI('ProductServiceURL', uri, 'DELETE')
                    .then((response) => response.json() )
                    .then((responseJson) => {
                        //alert(JSON.stringify(responseJson));
                        if ( responseJson.messages ) {
                            this.setState({
                                messages: responseJson.messages,
                                loading: false,
                            });
                            AsyncStorage.removeItem('ProdGroups');
                            this.fetchData();
                        } else if ( responseJson.error ) {
                            this.setState({
                                messages: [{
                                    message: responseJson.error,
                                    type: 'ERROR',
                                }],
                                loading: false,
                            })
                        }
                    })
                    .catch((error) => {
                        this.setState({
                            messages: [GENERIC_API_ERROR],
                            loading: false,
                        })
                    });

            }
        )

	}

    // End Swipe functions


    // Start Component functions
    fetchData = () => {

        this.setState({
            loading: true,
        });

        AsyncStorage.getItem('ProdGroups').then(storedProdGroups => {

            if ( storedProdGroups ) {
                if ( storedProdGroups ) {
                    this.setState({
                        prodGroups: JSON.parse(storedProdGroups),
                        loading: false,
                    });
                }

            } else {

                requestAPI('ProductServiceURL', '/vendoradmin/listproductsbygroup', 'GET')
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if ( responseJson.error ) {
                            this.setState({
                                messages: [{
                                    message: responseJson.error,
                                    type: 'ERROR',
                                }],
                                prodGroups: [],
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
                        //alert(error);
                        this.setState({
                            messages: [GENERIC_API_ERROR],
                            loading: false,
                        })
                        AsyncStorage.removeItem('ProdGroups');
                    });

            }

        });

    }

    goToProductReg = () => {
        this.props.navigation.navigate('ProductRegistration');
    }

    goToDetailScreen = (product) => {
        this.props.navigation.navigate('ProductRegistration', { ...product} );
    }

    // End Component functions

    render() {
        return (
            <View style={ListStyle.parentContainer}>
                <View>
                    <CustomValidationMessage message={this.state.messages} />
                </View>
                <SwipeListView
                    useSectionList
                    sections={this.state.prodGroups}
                    renderSectionHeader={({section}) => this.flatListHeader(section)}
                    ItemSeparatorComponent={flatListSeparator}
                    ListEmptyComponent={listEmpty("No product found.")}
                    keyExtractor={(item, index) => item.id + index}
                    renderItem={ (data, rowMap) => this.flatListContent(data.item)}
                    renderHiddenItem={ (data, rowMap) => this.flatListContentHidden(data.item, rowMap)}
                    disableRightSwipe={true}
                    rightOpenValue={-150}
                    previewRowKey={'1'}
                    previewOpenValue={-50}
                    previewOpenDelay={3000}
                />
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.goToProductReg}
                    style={CommonStyle.AddButton}>
                    <Image
                         source={require('../../res/icons/add_icon.png')}
                        style={CommonStyle.FloatingButtonStyle}/>
                </TouchableOpacity>
            </View>
        );
    }
}

export default withNavigationFocus(ProductFeed);

const styles = StyleSheet.create ({
    imageThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 50,
    },
	backTextWhite: {
		color: '#FFF'
	},
	rowFront: {
		alignItems: 'center',
		backgroundColor: Colors.white,
		borderBottomColor: Colors.darkgray,
		justifyContent: 'center',
        padding: 5,
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: '#DDD',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexGrow: 1,
		paddingLeft: 15,
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
})