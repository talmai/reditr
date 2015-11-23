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
                console.log(user);
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

    render() {
        // handle buttons states
        let button = <div className="account-header" onClick={this.startLogin.bind(this)}>Login</div>;
        if (this.state.user) {
            button = <div className="account-header">{this.state.user.username}</div>;
        } else if (this.state.isLoggingIn) {
            button = <div className="account-header">Waiting...</div>;
        }

        return button;
    }

}

export default AccountHeader
