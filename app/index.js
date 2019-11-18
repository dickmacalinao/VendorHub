import React from 'react';
import { createRootNavigator } from "./config/router";
import { isSignedIn, getPayload } from "./config/auth";
import { USER_ROLE_APP_ADMIN, USER_ROLE_VENDOR_ADMIN, USER_ROLE_VENDOR_USER } from "./config/constant";


export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            signedIn: false,
            layout: '',
        };
    }

    componentDidMount() {
        isSignedIn()
            .then(res => {
                //alert(res);
                if (res) {
                    getPayload()
                        .then(payload => {
                            switch( payload.role ) {
                                case USER_ROLE_APP_ADMIN:
                                    this.setState({ signedIn: res, layout: 'Admin' });
                                    break;
                                case USER_ROLE_VENDOR_ADMIN:
                                    this.setState({ signedIn: res, layout: 'Vendor' });
                                    break;
                                case USER_ROLE_VENDOR_USER:
                                    this.setState({ signedIn: res, layout: 'User' });
                                    break;
                            }
                        })
                        .catch((err => this.setState({ layout: '' })))
                } else {
                    this.setState({ signedIn: res, userRole: '', layout: '' })
                }


            })
            .catch(err => {
                this.setState({ signedIn: res, userRole: '', layout: '' })
            });
    }

    render() {
        const { signedIn, layout } = this.state;

        const Layout = createRootNavigator(signedIn, layout);
        return <Layout />;

    }
}