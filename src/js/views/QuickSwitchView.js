import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Link } from 'react-router';
import history from '../History.js';
import Observable from '../utilities/Observable';
import Keystrokes from '../Keystrokes';
import reddit from '../api/reddit';
import StreamSpinnerView from './StreamSpinnerView';
import { decodeEntities } from '../Utilities';

class QuickSwitchView extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.suggestedSubredditsViews = [];

        this.state = {
            suggestedQuery: "",
            suggestedSubreddits: [],
            selectedSuggestionIndex: 0,
            hasSubredditBio: false,
            subredditBioData: {}
        };
    }

    componentDidMount() {
        this.refs["query-input"].focus();
    }

    showSuggestedSubreddits()  {
        if (this.refs["query-input"].value == "") return;

        let query = this.refs["query-input"].value;
        this.setState({
            suggestedQuery: "",
            selectedSuggestionIndex: 0,
            suggestedSubreddits: []
        }, () => {
            reddit.searchForSubredditsWithQuery(query, (err, res) => {

                if (!err) {
                    // no error then we gucci
                    let suggestedQuery = res.body.names[this.state.selectedSuggestionIndex].substr(query.length)
                    this.setState({
                        suggestedQuery: query + suggestedQuery,
                        suggestedSubreddits: res.body.names
                    }, this.loadSelectedSubredditInfo);
                } else {
                    // error, reset state
                    this.setState({
                        suggestedQuery: "",
                        suggestedSubreddits: []
                    });
                }

            });
        });
    }

    loadSelectedSubredditInfo() {
        reddit.getSubredditBio(this.state.suggestedSubreddits[this.state.selectedSuggestionIndex], (err, res) => {
            this.setState({
                hasSubredditBio: true,
                subredditBioData: res.body.data
            });
        });
    }

    handleArrowKey(key) {
        let direction = {
            up: -1,
            down: 1
        }

        switch (key) {
            case 38: // up arrow
                this.selectSuggestionWithDirection(direction.up);
                break;
            case 39: // right arrow
                // fill the input bar
                if (this.state.suggestedSubreddits.length > 0) {
                    this.refs["query-input"].value = this.state.suggestedSubreddits[this.state.selectedSuggestionIndex];
                    this.setState({
                        suggestedQuery: this.refs["query-input"].value
                    });
                }
                break;
            case 40: // down arrow
                this.selectSuggestionWithDirection(direction.down);
                break;
        }
    }

    selectSuggestionWithDirection(direction) {
        let selectedSuggestionIndex = this.state.selectedSuggestionIndex + direction;

        if (selectedSuggestionIndex < 0 || selectedSuggestionIndex >= this.state.suggestedSubreddits.length) {
            // prevent out of bounds
            return;
        } else {
            let query = this.refs["query-input"].value;
            let suggestedQuery = this.state.suggestedSubreddits[selectedSuggestionIndex].substr(query.length);

            this.setState({
                selectedSuggestionIndex: selectedSuggestionIndex,
                suggestedQuery: query + suggestedQuery
            }, this.loadSelectedSubredditInfo);
        }
    }

    queryChanged(e) {

        // handle arrow keys, excluding left arrow since we don't have function for it
        if ([38, 39, 40].indexOf(e.which) > -1) {
            this.handleArrowKey(e.which);
            return;
        }

        // check if done typing
        clearTimeout(this.doneTyping);
        this.doneTyping = setTimeout(() => {
            this.showSuggestedSubreddits();
        }, 500);

        if (e.keyCode == 13) {
            let query = "/r/" + this.refs["query-input"].value;
            if (this.state.suggestedSubreddits.length > 0) {
                query = "/r/" + this.state.suggestedSubreddits[this.state.selectedSuggestionIndex];
            }
            Observable.global.trigger("pushNav", { text: query, href: query });
            //history.pushState(null, '/r/' + query);
            if(this.props.onSubredditChanged) this.props.onSubredditChanged();
        }
    }

    onClickSuggestion(e) {
        // get the clicked index
        let selectedIndex = parseInt(e.target.attributes["data-index"].value);

        let query = "/r/" + this.state.suggestedSubreddits[selectedIndex];
        Observable.global.trigger("pushNav", { text: query, href: query });
        //history.pushState(null, '/r/' + query);
        if(this.props.onSubredditChanged) this.props.onSubredditChanged();
    }

    render() {

        // more info section
        let moreInfo = false;
        // reset suggestions
        this.suggestedSubredditsViews = []
        if (this.state.suggestedSubreddits.length > 0) {
            this.state.suggestedSubreddits.forEach((name, index) => {
                let selectedClass = index == this.state.selectedSuggestionIndex ? "suggestion selected" : "suggestion";
                this.suggestedSubredditsViews.push((
                    <li ref={"suggestion-" + index} key={index} data-index={index} onClick={this.onClickSuggestion.bind(this)} className={selectedClass}>{name}</li>
                ));
            });

            let subredditInfo = (
                <div className="subreddit-sidebar">
                    <h3 className="header">{this.state.suggestedSubreddits[this.state.selectedSuggestionIndex]}</h3>
                    <StreamSpinnerView />
                </div>
            );

            if (this.state.hasSubredditBio) {
                let subredditData = this.state.subredditBioData;
                let body_html = decodeEntities(subredditData.public_description_html);

                let parsedHtml = "";
                if (body_html) {
                    // forces all links to open in new tab (faster than regex in newer versions of V8) http://jsperf.com/replace-all-vs-split-join
                    parsedHtml = body_html.split("<a ").join("<a target=\"_blank\" ");
                }

                subredditInfo = (
                    <div className="subreddit-sidebar">
                        <h3 className="header">{this.state.suggestedSubreddits[this.state.selectedSuggestionIndex]}</h3>
                        <img src={subredditData.header_img} className="header-image" />
                        <div className="description" dangerouslySetInnerHTML={{__html: parsedHtml}} />
                    </div>
                );
            }

            moreInfo = (
                <div className="more-info">
                    <ul className="suggested-subreddits">
                        {this.suggestedSubredditsViews}
                    </ul>
                    {subredditInfo}
                </div>
            );
        }

        return (
            <div className="quick-switch-view">
                <div className="input-container">
                    <div className="type">
                        /r/
                    </div>
                    <input className="query-input" ref="query-input" onKeyDown={this.queryChanged.bind(this)}/>
                    <input readOnly className="query-suggested" ref="query-suggested" value={this.state.suggestedQuery} />
                    {moreInfo}
                </div>
            </div>
        );
    }

}

export default QuickSwitchView;
