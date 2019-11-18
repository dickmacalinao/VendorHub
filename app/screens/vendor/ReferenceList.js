import React, { Component } from 'react';
import {
    TouchableOpacity,
    TouchableHighlight,
    Text,
    View,
    StyleSheet,
    Image,
    FlatList} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { withNavigationFocus } from "react-navigation";
import { TextField } from 'react-native-material-textfield';
import { SwipeListView } from 'react-native-swipe-list-view';

import { listEmpty, flatListSeparator } from "../../components/ListCommonComponent";
import CustomValidationMessage from '../../components/CustomValidationMessage';
import Colors from '../../components/Colors';

import { GENERIC_API_ERROR } from '../../config/messages';
import { getToken, getPayload} from "../../config/auth";
import { requestAPI } from '../../components/RestAPI';

import { ConfirmationAlert } from "../../utils/Util";

import CommonStyle from '../../styles/styles';
import ListStyle from '../../styles/styles-list';

class ReferenceList extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            refGroups: [],
            loading: false,
            messages: [],
        }
    }

    componentWillMount = () => {
        this.setState({
            messages: [],
            loading: true,
        });
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused != this.props.isFocused && this.props.isFocused) {
            this.setState({
                messages: [],
                loading: true,
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
                    <Text>{item.name}</Text>
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

                var uri = '/vendoradmin/deleteReferencedata/' + item.id;

                //alert(uri);
                requestAPI('ConfigServiceURL', uri, 'DELETE')
                    .then((response) => response.json() )
                    .then((responseJson) => {
                        //alert(JSON.stringify(responseJson));
                        if ( responseJson.messages ) {
                            this.setState({
                                messages: responseJson.messages,
                                loading: false,
                            });
                            //AsyncStorage.removeItem('ProdGroups');
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

    // Start component functions

    fetchData = () => {

        requestAPI('ConfigServiceURL', '/vendoradmin/viewreferencedatabyvendor', 'GET')
        .then((response) => response.json())
        .then((responseJson) => {
            if ( responseJson.error ) {
                this.setState({
                    messages: [{
                        message: responseJson.error,
                        type: 'ERROR',
                    }],
                    refGroups: [],
                    loading: false,
                });
            } else {
                this.setState({
                    refGroups: responseJson,
                });
            }
            //alert(JSON.stringify(responseJson));
        })
        .catch((error) => {
            //alert(error);
            this.setState({
                messages: [GENERIC_API_ERROR],
                loading: false,
            })
        });

    }

    goToRefReg = () => {
        this.props.navigation.navigate('ReferenceRegistration');
    }

    goToDetailScreen = (referenceData) => {
        this.props.navigation.navigate('ReferenceRegistration', {...referenceData});
    }
    // End component functions

    render() {
        return (
            <View style={ListStyle.parentContainer}>
                <View>
                    <CustomValidationMessage message={this.state.messages} />
                </View>
                <SwipeListView
                    useSectionList
                    sections={this.state.refGroups}
                    renderSectionHeader={({section}) => this.flatListHeader(section)}
                    ItemSeparatorComponent={flatListSeparator}
                    ListEmptyComponent={listEmpty("No reference data found.")}
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
                    onPress={this.goToRefReg}
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

export default withNavigationFocus(ReferenceList);

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