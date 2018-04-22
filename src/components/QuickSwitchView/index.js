import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Link } from 'react-router'
import PropTypes from 'prop-types'

import history from '../../utilities/History.js'
import Observable from '../../utilities/Observable'
import Keystrokes from '../../utilities/Keystrokes'
import reddit from '../../api/reddit'
import StreamSpinnerView from '../StreamSpinnerView'
import { decodeEntities } from '../../utilities/Common'

class QuickSwitchView extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  }

  static defaultProps = {
    onSubredditChanged() {}
  }

  constructor(props, context) {
    super(props, context)

    this.suggestedSubredditsViews = []

    this.state = {
      suggestedSubreddits: [],
      selectedSuggestionIndex: 0
    }
  }

  componentDidMount() {
    this.queryInput.focus()
  }

  showSuggestedSubreddits() {
    if (this.queryInput.value == '') return

    let query = this.queryInput.value
    this.setState(
      {
        selectedSuggestionIndex: 0,
        suggestedSubreddits: []
      },
      () => {
        reddit.searchForSubredditsWithQuery(query, (err, res) => {
          if (!err) {
            this.setState({
              suggestedSubreddits: res.body.data.children
            })
          } else {
            // error, reset state
            this.setState({
              suggestedSubreddits: []
            })
          }
        })
      }
    )
  }

  handleArrowKey(key) {
    let direction = {
      up: -1,
      down: 1
    }

    switch (key) {
      case 38: // up arrow
        this.selectSuggestionWithDirection(direction.up)
        break
      case 39: // right arrow
        // fill the input bar
        if (this.state.suggestedSubreddits.length > 0) {
          this.queryInput.value = this.state.suggestedSubreddits[this.state.selectedSuggestionIndex].data.display_name
        }
        break
      case 40: // down arrow
        this.selectSuggestionWithDirection(direction.down)
        break
    }
  }

  selectSuggestionWithDirection(direction) {
    let selectedSuggestionIndex = this.state.selectedSuggestionIndex + direction

    if (selectedSuggestionIndex < 0 || selectedSuggestionIndex >= this.state.suggestedSubreddits.length) {
      // prevent out of bounds
      return
    } else {
      let query = this.queryInput.value

      this.setState(
        {
          selectedSuggestionIndex: selectedSuggestionIndex
        },
        () => {
          let container = ReactDOM.findDOMNode(this.refs['subreddit-list'])
          let selectedRow = ReactDOM.findDOMNode(this.refs['selected-row'])

          // scroll down if we selected something below the scroll container
          if (container.scrollTop + container.offsetHeight < selectedRow.offsetTop + selectedRow.offsetHeight) {
            container.scrollTop = selectedRow.offsetTop + selectedRow.offsetHeight - container.offsetHeight
          }

          // scroll up if we selected something above the scroll container
          if (container.scrollTop + selectedRow.offsetHeight + 10 >= selectedRow.offsetTop) {
            container.scrollTop = selectedRow.offsetTop - 2 * selectedRow.offsetHeight
          }
        }
      )
    }
  }

  queryChanged = e => {
    // handle arrow keys, excluding left arrow since we don't have function for it
    if ([38, 39, 40].indexOf(e.which) > -1) {
      this.handleArrowKey(e.which)
      return
    }

    // check if done typing
    clearTimeout(this.doneTyping)
    this.doneTyping = setTimeout(() => {
      this.queryInput && this.showSuggestedSubreddits()
    }, 500)

    if (e.keyCode == 13) {
      let query = '/r/' + this.queryInput.value
      if (this.state.suggestedSubreddits.length > 0) {
        query = '/r/' + this.state.suggestedSubreddits[this.state.selectedSuggestionIndex].data.display_name
      }
      this.context.router.history.push(query)
      //history.pushState(null, '/r/' + query);
      if (this.props.onSubredditChanged) this.props.onSubredditChanged()
    }
  }

  onClickSuggestion(e) {
    // get the clicked index
    const selectedIndex = parseInt(e.target.attributes['data-index'].value)

    const query = '/r/' + this.state.suggestedSubreddits[selectedIndex].data.display_name
    this.context.router.history.push(query)

    this.props.onSubredditChanged()
  }

  backgroundClicked(e) {
    if (e.target.classList.contains('quick-switch-view')) {
      Observable.global.trigger('requestExitQuickSwitcher')
    }
  }

  render() {
    // more info section
    let moreInfo = false
    // reset suggestions
    this.suggestedSubredditsViews = []
    if (this.state.suggestedSubreddits.length > 0) {
      this.state.suggestedSubreddits.forEach((subreddit, index) => {
        let selectedClass = index == this.state.selectedSuggestionIndex ? 'suggestion selected' : 'suggestion'
        let ref = index == this.state.selectedSuggestionIndex ? 'selected-row' : ''
        this.suggestedSubredditsViews.push(
          <li ref={ref} key={index} data-index={index} onClick={this.onClickSuggestion.bind(this)} className={selectedClass}>
            {subreddit.data.display_name}
          </li>
        )
      })

      let selectedSubreddit = this.state.suggestedSubreddits[this.state.selectedSuggestionIndex].data
      let body_html = decodeEntities(selectedSubreddit.public_description_html)

      let parsedHtml = ''
      if (body_html) {
        // forces all links to open in new tab (faster than regex in newer versions of V8) http://jsperf.com/replace-all-vs-split-join
        parsedHtml = body_html.split('<a ').join('<a target="_blank" ')
      }

      let subredditInfo = (
        <div className="subreddit-sidebar">
          <h3 className="header">{selectedSubreddit.display_name}</h3>
          <img src={selectedSubreddit.header_img} className="header-image" />
          <div className="description" dangerouslySetInnerHTML={{ __html: parsedHtml }} />
        </div>
      )

      moreInfo = (
        <div className="more-info">
          <ul ref="subreddit-list" className="suggested-subreddits">
            {this.suggestedSubredditsViews}
          </ul>
          {subredditInfo}
        </div>
      )
    }

    return (
      <div className="quick-switch-view" onClick={this.backgroundClicked.bind(this)}>
        <div className="input-container">
          <div className="type">/r/</div>
          <input className="query-input" ref={i => (this.queryInput = i)} onKeyDown={this.queryChanged} />
          {moreInfo}
        </div>
      </div>
    )
  }
}

export default QuickSwitchView
