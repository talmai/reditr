import React from 'react'
import { render } from 'react-dom'

class CreateNotificationView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            message: "",
            link: ""
        }
    }

    onMessageChange(event) {
        this.setState({ message: event.target.value })
    }

    onLinkChange(event) {
        this.setState({ link: event.target.value })
    }

    onSendNotification() {

        let Notification = Parse.Object.extend("Notification")
        let notifications = []
        let query = new Parse.Query(Parse.Object.extend("GhostUser"))
        query.find({
          success: function(results) {

            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                let notif = new Notification()
                notif.set("message", this.state.message)
                notif.set("link", this.state.link)
                notif.set("forUser", results[i])
                notifications.push(notif)
            }

            Parse.Object.saveAll(notifications, {
                success: function(objs) {
                    alert("Sent!")
                },
                error: function(error) {
                    // an error occurred...
                }
            });
          }.bind(this),
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });

    }

    render() {
        return (
            <div className="CreateNotificationView">
                <textarea placeholder="Message here" onChange={this.onMessageChange.bind(this)} />
                <input type="text" onChange={this.onLinkChange.bind(this)} placeholder="Where should the notification take them after clicking it?" />
                <input type="submit" value="SEND" onClick={this.onSendNotification.bind(this)} />
            </div>
        )
    }

}

export default CreateNotificationView
