import React from 'react';

import UserManager from '../account/UserManager';

class AccountHeader extends React.Component {

    constructor(props) {
        super(props);
    }

    startLogin() {
        UserManager.startLogin((status, user) => {
            if (status == "success") {
                console.log(user);
            }
        });
    }

    render() {
        return (
            <div className="account-header" onClick={this.startLogin}>Login</div>
        );
    }

}

export default AccountHeader
