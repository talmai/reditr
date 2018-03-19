import redditLogo from '../../images/reddit.png'
import style from '../../utilities/Style'
import { className } from '../../utilities/Common'
import React from 'react'
import { Link } from 'react-router-dom'

const ListItemView = (props => {
  const linkClassName = className(props.classes.link, {
    [props.classes.linkAnimate]: props.animateIn
  })
  const displayName = props.subreddit.url.replace(/^\/r|\//g, '')
  const src = props.subreddit.icon_img !== "" ? props.subreddit.icon_img : redditLogo
  return (
    <Link to={`/r/${displayName}`} className={linkClassName}>
      <img className={props.classes.subredditIcon} src={src} />
      <span className={props.classes.rSlash}>r/</span>
      {displayName}
    </Link>
  )
}).style({
  link: {
    backgroundSize: '24px auto',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '30px center',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    height: '35px',
    textDecoration: 'none',
    opacity: 0,
    transform: 'translateX(-100px)',
    transition: 'all 0.25s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    '&:first-child': {
      marginTop: '5px',
    }
  },
  linkAnimate: {
    opacity: 1,
    transform: 'translateX(0px)'
  },
  subredditIcon: {
    width: '20px',
    marginRight: '12px',
    marginLeft: '20px'
  },
  rSlash: {
    color: 'rgba(0, 0, 0, 0.4)'
  }
})

export default ListItemView
