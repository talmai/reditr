import React from 'react';
import { render } from 'react-dom';
import { Link } from 'react-router';

class HeaderView extends React.Component {

    onClickLogout() {
        Parse.User.logOut();
        window.location.href = './index.html';
    }

    render() {
        return (
            <div id="HeaderView">
                <img className="logo" src="images/logo.png" />
                <ul className="mini-nav">
                    <a onClick={this.onClickLogout.bind(this)}>Logout</a>
                </ul>
            </div>
        )
    }

}

export default HeaderView
