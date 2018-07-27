import styled from 'styled-components'
import classNames from 'classnames'

const Panel = styled.div.attrs({
    className: 'panel panel-default'
})`
    .panel-body {
        transition: max-height .4s ease, padding .5s ease;
        overflow:  auto;
        max-height: ${ ({ collapsed }) => collapsed ? '0vh' : '100vh' };
        padding-top: ${ ({ collapsed }) => collapsed ? '0' : '15px' };
        padding-bottom: ${ ({ collapsed }) => collapsed ? '0' : '15px' };
    }
`

Object.assign(Panel, {
    Heading: styled.div.attrs({
        className: 'panel-heading'
    })``,

    Body: styled.div.attrs({
        className: 'panel-body'
    })``,

    Footer: styled.div.attrs({
        className: 'panel-footer'
    })``,
})

export default Panel
