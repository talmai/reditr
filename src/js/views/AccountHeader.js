import React from 'react';

import Observable from '../utilities/Observable';
import UserManager from '../account/UserManager';

class AccountHeader extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: UserManager.currentUser,
            isLoggingIn: false
        }
    }

    startLogin() {
        this.setState({
            isLoggingIn: true
        });

        UserManager.startLogin((status, user) => {
            if (status == "success") {
                this.setState({
                    user: user,
                    isLoggingIn: false
                });
            } else {
                this.setState({
                    isLoggingIn: false
                });
            }
        });
    }

    componentDidMount() {
        Observable.global.on(this, 'updateCurrentUser', this.onUpdateCurrentUser);
    }

    onUpdateCurrentUser(data) {
        this.setState({
            user: data.user,
            isLoggingIn: false
        });
    }

    logout() {
        UserManager.logout();
    }

    render() {
        // handle buttons states
        let button = <div className="account-header" onClick={this.startLogin.bind(this)}>Login</div>;
        if (this.state.user) {
            button = <div className="account-header" onClick={this.logout.bind(this)}>{this.state.user.username}</div>;
        } else if (this.state.isLoggingIn) {
            button = <div className="account-header">Waiting...</div>;
        }

        return button;
    }

}

export default AccountHeader
