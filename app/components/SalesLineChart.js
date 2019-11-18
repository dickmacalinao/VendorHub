import React, { Component } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    StyleSheet} from 'react-native';
import {
  LineChart,
} from 'react-native-chart-kit';

import { requestAPI } from './RestAPI';
import { GENERIC_API_ERROR } from '../config/messages';

import CustomValidationMessage from './CustomValidationMessage';

import CommonStyle from '../styles/styles';
import Colors from './Colors';

export default class extends Component {

    constructor(props) {
        super(props)
        this.state = {
            labels: [],
            data: [0],
            messages: [],
            loading: false,
            chartReq: {
                status: this.props.status,
                chartDataContent: this.props.chartDataContent,
                labelBy: this.props.labelBy,
                dateFrom: this.props.dateFrom,
                dateTo: this.props.dateTo,
            }
        }

    }

    componentWillMount = () => {
        this.getChartData(this.state.chartReq);
    }

    componentWillReceiveProps(props) {
        //alert(JSON.stringify(props));
        //console.log(props);
        var tmpChartReq = {
           status: props.status,
           chartDataContent: props.chartDataContent,
           labelBy: props.labelBy,
           dateFrom: props.dateFrom,
           dateTo: props.dateTo,
       }
        this.setState({
            chartReq: tmpChartReq,
            loading: true,
        });
        this.getChartData(tmpChartReq);
    }

    getChartData =(chartReq) => {
        //alert(JSON.stringify(chartReq));
        requestAPI('OrderServiceURL', '/vendoradmin/getorderchart', 'POST', chartReq)
            .then((response) => response.json() )
            .then((responseJson) => {
                //alert(JSON.stringify(responseJson));
                if ( responseJson.messages ) {
                    this.setState ({
                        labels: (responseJson.labels ? responseJson.labels : []),
                        data: (responseJson.dataset && responseJson.dataset.data  ? responseJson.dataset.data : [0]),
                        messages: responseJson.messages,
                        loading: false,
                    });

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
                //alert(error);
                this.setState({
                    messages: [GENERIC_API_ERROR],
                    loading: false,
                })
            });
    }

    render() {
        return (
            <View>
                <View style = {CommonStyle.activityIndicator} pointerEvents={'none'}>
                    <ActivityIndicator
                        animating = {this.state.loading}
                        color = '#bc2b78'
                        size = "large"/>
                </View>
                <Text style={{fontFamily: 'Courier', fontWeight: 'bold', }}>Order Status: {this.props.status}</Text>
                <CustomValidationMessage message={this.state.messages} />
                <LineChart
                    data={{
                        labels: this.state.labels,
                        datasets: [{
                            data: this.state.data,
                        }]
                    }}
                    width={Dimensions.get('window').width-10} // from react-native
                    height={220}
                    yAxisLabel={this.state.chartReq.chartDataContent=='BySales' ? 'P' : ''}
                    chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: Colors.dodgerblue,
                        backgroundGradientTo: Colors.darkslateblue,
                        decimalPlaces: (this.state.chartReq.chartDataContent=='BySales' ? 2 : 0), // optional, defaults to 2dp
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            </View>
        )

    }
}

