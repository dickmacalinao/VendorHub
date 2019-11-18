import React, { Component } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    ScrollView,
    Dimensions,
    StyleSheet} from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import DatePicker from 'react-native-datepicker';
import { CheckBox } from 'react-native-elements';

import { DynamicDropDown } from '../../components/CommonComponent';
import { CustomButton } from '../../components/CommonComponent';

import CommonStyle from '../../styles/styles';
import Colors from '../../components/Colors';

export default class extends Component {

    // Start Components triggers
    constructor(props) {
        super(props);
        this.state = {
            dateFrom: moment(new Date()).format('YYYY-MM-DD'),
            dateTo: moment(new Date()).format('YYYY-MM-DD'),
            status: '',
            userId: '',
            appUserList: [],
        };
    }

    onLayout(e) {
        const {width, height} = Dimensions.get('window')
        console.log(width, height)
        this.setState({
            content_header_style: (height>width ? styles.content_header_portrait : styles.content_header_landscape),
        });
    }

    componentWillMount = () => {

        if (this.props.navigation.state.params) {
            //alert(JSON.stringify(this.props.navigation.state.params));
            const { dateFrom, dateTo, status, userId } = this.props.navigation.state.params;
            this.setState({
                dateFrom: dateFrom,
                dateTo: dateTo,
                status: status,
                userId: userId,
            });
        }

        this.getAppUserList();

    }

    // End Components triggers

    setDateFormat = (label) => {
        if ( label=='Yearly' ) {
            this.setState({
                labelBy: label,
                dateFrom: moment(new Date()).format('YYYY') + '-01-01',
                dateTo: moment(new Date()).format('YYYY-MM-DD'),
            });
        } else if ( label=='Monthly' ) {
            this.setState({
                labelBy: label,
                dateFrom: moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD'),
                dateTo: moment(new Date()).format('YYYY-MM-DD'),
            });
        } else {
            this.setState({
                labelBy: label,
                dateFrom: moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD'),
                dateTo: moment(new Date()).format('YYYY-MM-DD'),
            });
        }

    }

    getAppUserList = () => {

        AsyncStorage.getItem('AppUserList').then(appUserList => {

            if ( appUserList!=null ) {
                var jsonData = JSON.parse(appUserList)
                var oList = []
                var oListData = {};
                oListData.value = '';
                oListData.label = 'All'
                oList.push(oListData);
                for (var i = 0; i < jsonData.length; i++) {
                    oListData = {};
                    oListData.value = jsonData[i].value;
                    oListData.label = jsonData[i].label;
                    oList.push(oListData);
                }
                this.setState({appUserList: oList})
            } else {
                this.setState({appUserList: []})
            }



        });

    }

    showChart = () => {
        //alert(JSON.stringify(this.state));
        this.props.navigation.navigate('OrderList', {...this.state});
    }

    render() {
        return (
            <View style={CommonStyle.mainContainer} onLayout={this.onLayout.bind(this)}>
                <View style={styles.buttonHeader}>
                    <CustomButton
                        visible={true}
                        primary label='Show Order List'
                        width={150}
                        onPress={this.showChart}/>
                </View>
                <ScrollView style={styles.filter}>
                    <Text>{"\n"}Order Date</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center',}}>
                        <DatePicker
                            style={{width: 130}}
                            date={this.state.dateFrom} //initial date from state
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
                            onDateChange={(date) => this.setState({dateFrom: date})}
                        />
                        <Text>&nbsp;&nbsp;&nbsp;&nbsp;</Text>
                        <DatePicker
                            style={{width: 130}}
                            date={this.state.dateTo} //initial date from state
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
                            onDateChange={(date) => this.setState({dateTo: date})}
                        />
                    </View>
                    <DynamicDropDown
                        visible={true}
                        label='Status'
                        containerStyle={{width: 150}}
                        data={[
                            {value: '', label: 'All'},
                            {value: 'New', label: "New"},
                            {value: 'Ordering', label: 'Ordering'},
                            {value: 'Paid', label: 'Paid'},
                            {value: 'Cancelled', label: 'Cancelled'},
                            {value: 'Refund', label: 'Refund'}
                        ]}
                        value={this.state.status}
                        onChangeText={(value) => this.setState({status: value})}
                    />
                    <DynamicDropDown
                        visible={true}
                        label='User'
                        data={this.state.appUserList}
                        value={this.state.userId}
                        onChangeText={(value) => this.setState({userId: value})}
                    />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonHeader: {
        flexDirection: 'row',
    },
    filter: {
        flex: 1,
        flexDirection: 'column',
    },
});