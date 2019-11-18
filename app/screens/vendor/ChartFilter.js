import React, { Component } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    ScrollView,
    Dimensions,
    StyleSheet} from 'react-native';
import moment from 'moment';
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
            chartDataContent: 'BySales',
            labelBy: 'Daily',
            dateFrom: moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD'),
            dateTo: moment(new Date()).format('YYYY-MM-DD'),
            status_new: false,
            status_ordering: false,
            status_paid: true,
            status_cancelled: false,
            status_refund: false,
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
            const { chartDataContent, labelBy, dateFrom, dateTo, status_new, status_ordering, status_paid, status_cancelled, status_refund } = this.props.navigation.state.params;
            this.setState({
                chartDataContent: chartDataContent,
                labelBy: labelBy,
                dateFrom: dateFrom,
                dateTo: dateTo,
                status_new: status_new,
                status_ordering: status_ordering,
                status_paid: status_paid,
                status_cancelled: status_cancelled,
                status_refund: status_refund,
            });
        }

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

    showChart = () => {
        this.props.navigation.navigate('Chart', {...this.state});
    }

    render() {
        return (
            <View style={CommonStyle.mainContainer} onLayout={this.onLayout.bind(this)}>
                <View style={styles.buttonHeader}>
                    <CustomButton
                        visible={true}
                        primary label='Show Chart'
                        width={150}
                        onPress={this.showChart}/>
                </View>
                <ScrollView style={styles.filter}>
                    <DynamicDropDown
                        visible={true}
                        label='Chart Content'
                        containerStyle={{width: 150}}
                        data={
                            [{value: 'ByCount', label: 'By Count'},
                            {value: 'BySales', label: 'By Sales'}]
                        }
                        value={this.state.chartDataContent}
                        onChangeText={(value) => this.setState({chartDataContent: value})}
                    />
                    <DynamicDropDown
                        visible={true}
                        label='Label By'
                        containerStyle={{width: 150}}
                        data={
                            [{value: 'Yearly'},
                            {value: 'Monthly'},
                            {value: 'Daily'}]
                        }
                        value={this.state.labelBy}
                        onChangeText={(value) => this.setDateFormat(value)}
                    />
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
                    <Text>{"\n"}Order Status</Text>
                    <CheckBox
                        title='New'
                        checked={this.state.status_new}
                        onPress={() => this.setState({status_new: !this.state.status_new})}
                    />
                    <CheckBox
                        title='Ordering'
                        checked={this.state.status_ordering}
                        onPress={() => this.setState({status_ordering: !this.state.status_ordering})}
                    />
                    <CheckBox
                        title='Paid'
                        checked={this.state.status_paid}
                        onPress={() => this.setState({status_paid: !this.state.status_paid})}
                    />
                    <CheckBox
                        title='Cancelled'
                        checked={this.state.status_cancelled}
                        onPress={() => this.setState({status_cancelled: !this.state.status_cancelled})}
                    />
                    <CheckBox
                        title='Refund'
                        checked={this.state.status_refund}
                        onPress={() => this.setState({status_refund: !this.state.status_refund})}
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