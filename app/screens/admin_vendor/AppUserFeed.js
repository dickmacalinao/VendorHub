import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator
    } from 'react-native';
import { ListItem, SearchBar, Avatar } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import { withNavigationFocus } from "react-navigation";
import { SwipeListView } from 'react-native-swipe-list-view';

import CustomValidationMessage from '../../components/CustomValidationMessage';
import Colors from '../../components/Colors';

import { getPayload, validateIfStillAuthorized } from "../../config/auth";
import { USER_ROLE_APP_ADMIN, USER_ROLE_VENDOR_ADMIN } from "../../config/constant";
import { GENERIC_API_ERROR } from '../../config/messages';
import { requestAPI } from '../../components/RestAPI';
import { clean } from "../../utils/Util";
import { listEmpty, flatListSeparator } from "../../components/ListCommonComponent";

import { ConfirmationAlert } from "../../utils/Util";

import CommonStyle from '../../styles/styles';
import ListStyle from '../../styles/styles-list';

class AppUserFeed extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            role: '',
            loading: false,
            searchKey: '',
            appUsers: [],
            messages: [],
        };
        //this.rowSwipeAnimatedValues = {};
    }

    componentWillMount = () => {

        getPayload()
        .then(payload => {
            this.setState({
                role: payload.role,
                messages: [],
                loading: true,
            });
            this.fetchData();
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused && this.props.isFocused) {
            this.setState({
                messages: [],
                loading: true,
            });
            this.fetchData(this.state.searchKey);
        }
    }

    // End Components triggers

    // Start Swipe functions
    flatListHeader = () => {
        return (
            <View style={ListStyle.flatlist_header_group}>
                <Text style={[ListStyle.flatlist_header_text, { flex: 1 }]}>App User List</Text>
            </View>
        );
    }

    flatListContent = (item) => {
        return (
            <TouchableOpacity onPress={this.goToDetailScreen.bind(this, item)} style={styles.rowFront}>
                <View style={{ flex: 1, flexDirection:'row'}} key={item.id}>
                    <View style={{
                            flex: 1,
                            flexDirection:'row',
                            padding: 2,
                            //backgroundColor: index % 2 == 0 ? Colors.palevioletred : Colors.slategray,
                    }}>
                        <Avatar
                            rounded
                            size="medium"
                            activeOpacity={0.7}
                            source={
                                (
                                    item.role==USER_ROLE_APP_ADMIN ? require("../../res/icons/admin.jpg") : (
                                        item.role==USER_ROLE_VENDOR_ADMIN ? require("../../res/icons/vendor.jpg") : require("../../res/icons/user.jpg")
                                    )
                                )
                            }
                        />
                        <View style={{
                                flex: 1,
                                flexDirection:'column',
                                height: 50
                            }}>
                                <Text style={{padding: 2, fontSize: 14}}>{item.username + (item.activeIndicator ? '' : ' (inactive)')}</Text>
                                <Text style={{padding: 2, fontSize: 14}}>{item.name}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity >
        )
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
        )
    }

	cancelRow(rowMap, rowKey) {
		if (rowMap[rowKey]) {
			rowMap[rowKey].closeRow();
		}
	}

	deleteRow(rowMap, item) {

        ConfirmationAlert('Delete', 'Do you want to delete ' + item.username + '?',
            () => {
                this.setState({
                    loading: true,
                });

                var uri = (this.state.role==USER_ROLE_APP_ADMIN ? '/appadmin/deleteappuser/' : '/vendoradmin/deleteappuser/') + item.id;

                requestAPI('AppUserServiceURL', uri, 'DELETE')
                    .then((response) => response.json() )
                    .then((responseJson) => {
                        //alert(JSON.stringify(responseJson));
                        if ( responseJson.messages ) {
                            this.setState({
                                messages: responseJson.messages,
                                loading: false,
                            });
                            this.fetchData(this.state.searchKey);
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

    fetchData = (criteria) => {

        this.setState({
            searchKey: criteria,
        });

        var uri = "";
        var uri = this.state.role==USER_ROLE_APP_ADMIN ? '/appadmin' : '/vendoradmin';
        uri = uri + (criteria ? '/searchappusers/' + clean(criteria) : '/findallappusers');

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
                            appUsers: [],
                            loading: false,
                        });
                    } else {
                        this.setState({
                            appUsers: responseJson,
                            loading: false,
                        });
                    }
                }
                //alert(JSON.stringify(responseJson));
            })
            .catch((error) => {
                this.setState({
                    messages: [GENERIC_API_ERROR],
                    loading: false,
                })
            });

    }

    goToDetailScreen = (appUser) => {
        this.props.navigation.navigate('AppUserRegistration', { ...appUser} );
    }

    goToAppUserReg = () => {
        this.props.navigation.navigate('AppUserRegistration');
    }

    // End Component functions

    render () {
        return (
            <View style={ListStyle.parentContainer}>
                <View style = {CommonStyle.activityIndicator} pointerEvents={'none'}>
                    <ActivityIndicator
                        animating = {this.state.loading}
                        color = '#bc2b78'
                        size = "large"/>
                </View>
                <View>
                    <CustomValidationMessage message={this.state.messages} />
                </View>
                { this.state.role == USER_ROLE_APP_ADMIN &&
                    <SearchBar
                        placeholder="Search App User..."
                        lightTheme
                        round
                        ref={ref => searchInput = ref}
                        value={this.state.searchKey}
                        showLoading={true}
                        loadingProps={{animating: this.state.loading}}
                        onChangeText={text => this.fetchData(text)}
                        autoCorrect={false}
                    />
                }
                <SwipeListView
                    data={this.state.appUsers}
                    keyExtractor={(item, index) => item.id + index}
                    renderItem={ (data, rowMap) => this.flatListContent(data.item)}
                    renderHiddenItem={ (data, rowMap) => this.flatListContentHidden(data.item, rowMap)}
                    ListHeaderComponent={this.flatListHeader}
                    ItemSeparatorComponent={flatListSeparator}
                    ListEmptyComponent={listEmpty("No app user found.")}
                    //stickyHeaderIndices={[0]}
                    disableRightSwipe={true}
                    rightOpenValue={-150}
                    previewRowKey={'1'}
                    previewOpenValue={-50}
                    previewOpenDelay={3000}
                />
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.goToAppUserReg}
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

export default withNavigationFocus(AppUserFeed);

const styles = StyleSheet.create ({
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
})