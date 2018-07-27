import styled from 'styled-components'
import classnames from 'classnames'
import { Link } from 'react-router-dom'

const Navbar = styled.nav.attrs({
    className: 'navbar navbar-default'
})``

Object.assign(Navbar, {
    Header: styled.div.attrs({
        className: 'navbar-header'
    })``,

    Nav: styled.ul.attrs({
        className: props => classnames([
            'nav',
            'navbar-nav',
            props.navbarRight && 'navbar-right',
            props.navbarLeft && 'navbar-left',
        ])
    })``,

    Form: styled.form.attrs({
        className: props => classnames([
            'navbar-form',
            props.navbarRight && 'navbar-right',
            props.navbarLeft && 'navbar-left',
        ])
    })``,

    Item: styled.li.attrs({
        className: 'navbar-item'
    })``,

    Brand: styled.a.attrs({
        className: 'navbar-brand'
    })``,

    Text: styled.p.attrs({
        className: 'navbar-text'
    })``,

    Link: styled.a.attrs({
        className: 'navbar-link'
    })``
})

export default Navbar